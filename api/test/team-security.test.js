import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import express from 'express';
import jwt from 'jsonwebtoken';
import { PGlite } from '@electric-sql/pglite';
import { pool } from '../src/config/db.config.js';
import { buildRoutes } from '../src/routes/index.js';

test('team lifecycle and server-side isolation with PostgreSQL', async (t) => {
  process.env.JWT_SECRET = 'test-only-secret';
  delete process.env.AUTH_KEY;
  const db = new PGlite();
  const schema = (
    await fs.readFile(new URL('../src/create.sql', import.meta.url), 'utf8')
  ).replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '');
  await db.exec(schema);
  await db.exec(
    await fs.readFile(
      new URL('../migrations/20261104_equipes.sql', import.meta.url),
      'utf8'
    )
  );
  await db.exec(
    "INSERT INTO funcao(id,tipo) VALUES(1,'Adm'),(2,'Gerente'),(3,'Desenvolvedor'),(4,'Analista')"
  );
  const originalConnect = pool.connect;
  pool.connect = async () => ({
    query: async (sql, args) =>
      args ? db.query(sql, args) : (await db.exec(sql))[0] || { rows: [] },
    release() {},
  });
  const app = express();
  app.use(express.json());
  app.use(
    buildRoutes({
      controllers: {
        auth: {
          login(_req, res) {
            res.sendStatus(501);
          },
          register(_req, res) {
            res.sendStatus(501);
          },
        },
      },
    })
  );
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const url = 'http://127.0.0.1:' + server.address().port;
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    pool.connect = originalConnect;
    await db.close();
    await pool.end();
  });
  const call = async (path, method = 'GET', body, email) => {
    const response = await fetch(url + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(email
          ? {
              Authorization:
                'Bearer ' + jwt.sign({ email }, process.env.JWT_SECRET),
            }
          : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return {
      status: response.status,
      body: response.status === 204 ? null : await response.json(),
    };
  };
  const register = (nome, extra = {}) =>
    call('/auth/register', 'POST', {
      nome,
      sobrenome: 'Teste',
      email: nome.toLowerCase() + '@test.local',
      senha: 'password123',
      funcaoId: 3,
      ...extra,
    });
  let alpha, beta, alice, bob, carol, project, task, comment, invite;
  await t.test('public registration cannot grant manager access', async () => {
    assert.equal((await register('Manager', { funcaoId: 2 })).status, 400);
    assert.equal((await db.query('SELECT * FROM usuario')).rows.length, 0);
  });
  await t.test(
    'account and team are created atomically with a password hash',
    async () => {
      const result = await register('Alice', {
        novaEquipe: { nome: 'Alpha', senha: 'team-secret' },
      });
      assert.equal(result.status, 200);
      alice = result.body.id;
      const team = (await db.query('SELECT * FROM equipe WHERE NOT sistema'))
        .rows[0];
      alpha = team.id;
      assert.match(team.senha, /^\$2/);
      assert.equal(team.id_lider, alice);
      assert.equal(
        (await db.query('SELECT * FROM membro_equipe')).rows[0].usuario_id,
        alice
      );
    }
  );
  await t.test('wrong team password rolls back registration', async () => {
    assert.equal(
      (await register('Bob', { equipeId: alpha, senhaEquipe: 'incorrect' }))
        .status,
      400
    );
    assert.equal(
      (await db.query("SELECT * FROM usuario WHERE nome='Bob'")).rows.length,
      0
    );
  });
  await t.test('normalized full names are unique', async () => {
    assert.equal(
      (
        await register(' alice ', {
          email: 'different@test.local',
          sobrenome: '  TESTE ',
        })
      ).status,
      409
    );
  });
  await t.test('membership and no-team profiles', async () => {
    bob = (
      await register('Bob', { equipeId: alpha, senhaEquipe: 'team-secret' })
    ).body.id;
    carol = (await register('Carol')).body.id;
    const profile = await call('/sessao', 'GET', null, 'carol@test.local');
    assert.equal(profile.body.equipe, null);
    assert.deepEqual(
      (await call('/tarefas', 'GET', null, 'carol@test.local')).body,
      []
    );
    assert.equal(
      (
        await call(
          '/tarefas',
          'POST',
          { titulo: 'Blocked' },
          'carol@test.local'
        )
      ).status,
      403
    );
    assert.equal(
      (
        await call(
          '/usuarios/' + carol,
          'PUT',
          { nome: 'Carol', sobrenome: 'Teste' },
          'carol@test.local'
        )
      ).status,
      200
    );
  });
  await t.test(
    'create a second team and reject a second membership',
    async () => {
      const result = await call(
        '/equipes',
        'POST',
        { nome: 'Beta', senha: 'second-secret' },
        'carol@test.local'
      );
      assert.equal(result.status, 200);
      beta = result.body.id;
      assert.equal(
        (
          await call(
            '/equipes/' + beta + '/entrar',
            'POST',
            { senha: 'second-secret' },
            'bob@test.local'
          )
        ).status,
        409
      );
      assert.equal(
        (
          await call(
            '/equipes',
            'POST',
            { nome: 'Other', senha: 'password123' },
            'bob@test.local'
          )
        ).status,
        409
      );
    }
  );
  await t.test(
    'project and task ownership are taken from the authenticated user',
    async () => {
      project = (
        await call(
          '/projetos',
          'POST',
          { titulo: 'Alpha project', idEquipe: beta },
          'alice@test.local'
        )
      ).body;
      assert.equal(project.idEquipe, alpha);
      const created = await call(
        '/tarefas',
        'POST',
        {
          titulo: 'Alpha task',
          idProjeto: project.id,
          idCriador: carol,
          idResponsavel: bob,
          economia: 12.5,
        },
        'alice@test.local'
      );
      assert.equal(created.status, 200);
      task = created.body;
      assert.equal(task.idEquipe, alpha);
      assert.equal(task.idCriador, alice);
      assert.equal(task.economia, 12.5);
    }
  );
  await t.test(
    'moving a task returns success and persists the new status',
    async () => {
      const moved = await call(
        '/tarefas/' + task.id,
        'PUT',
        { status: 'iniciado' },
        'bob@test.local'
      );
      assert.equal(moved.status, 200);
      assert.equal(moved.body.status, 'iniciado');
    }
  );
  await t.test('other teams cannot read, edit or delete tasks', async () => {
    assert.deepEqual(
      (await call('/tarefas', 'GET', null, 'carol@test.local')).body,
      []
    );
    for (const method of ['GET', 'PUT', 'DELETE'])
      assert.equal(
        (
          await call(
            '/tarefas/' + task.id,
            method,
            method === 'PUT' ? { status: 'finalizado' } : null,
            'carol@test.local'
          )
        ).status,
        404
      );
    assert.equal(
      (
        await call(
          '/tarefas/' + task.id + '?equipe=' + alpha,
          'GET',
          null,
          'carol@test.local'
        )
      ).status,
      404
    );
  });
  await t.test(
    'cross-team project, assignee and progress references are rejected',
    async () => {
      const other = (
        await call(
          '/projetos',
          'POST',
          { titulo: 'Beta project' },
          'carol@test.local'
        )
      ).body;
      const progress = (
        await call(
          '/andamentos',
          'POST',
          { titulo: 'Beta progress', ordem: 0 },
          'carol@test.local'
        )
      ).body;
      for (const body of [
        { idProjeto: other.id },
        { idResponsavel: carol },
        { idAndamento: progress.id },
      ])
        assert.equal(
          (await call('/tarefas/' + task.id, 'PUT', body, 'alice@test.local'))
            .status,
          400
        );
    }
  );
  await t.test(
    'comments inherit task isolation and cannot impersonate authors',
    async () => {
      comment = (
        await call(
          '/tarefas/' + task.id + '/comentarios',
          'POST',
          { detalhe: 'Hello', idUsuario: carol },
          'bob@test.local'
        )
      ).body;
      assert.equal(comment.idUsuario, bob);
      assert.equal(
        (
          await call(
            '/tarefas/' + task.id + '/comentarios',
            'GET',
            null,
            'carol@test.local'
          )
        ).status,
        404
      );
    }
  );
  await t.test(
    'public lists and team members never expose password hashes',
    async () => {
      const teams = await call('/equipes-publicas');
      assert.equal(JSON.stringify(teams.body).includes('senha'), false);
      assert.equal(
        (
          await call(
            '/equipes/' + alpha + '/membros',
            'GET',
            null,
            'carol@test.local'
          )
        ).status,
        403
      );
      assert.equal(
        JSON.stringify(
          (await call('/usuarios', 'GET', null, 'alice@test.local')).body
        ).includes('senha'),
        false
      );
    }
  );
  await t.test(
    'manager can inspect all teams or filter one team but cannot mutate',
    async () => {
      await db.query(
        "INSERT INTO usuario(nome,sobrenome,email,senha,funcao_id) VALUES('Gestor','Teste','gestor@test.local','not-used',2)"
      );
      assert.equal(
        (await call('/tarefas', 'GET', null, 'gestor@test.local')).body.length,
        1
      );
      assert.deepEqual(
        (
          await call(
            '/tarefas?equipe=' + beta,
            'GET',
            null,
            'gestor@test.local'
          )
        ).body,
        []
      );
      for (const [path, method, body] of [
        ['/tarefas', 'POST', { titulo: 'x' }],
        ['/tarefas/' + task.id, 'PUT', { status: 'finalizado' }],
        ['/tarefas/' + task.id, 'DELETE'],
        ['/equipes', 'POST', { nome: 'x', senha: 'password123' }],
        ['/funcoes', 'POST', { tipo: 'Admin' }],
      ]) {
        const result = await call(path, method, body, 'gestor@test.local');
        assert.ok([403, 405].includes(result.status));
      }
    }
  );
  await t.test(
    'legacy membership endpoints and role changes cannot bypass permissions',
    async () => {
      assert.equal(
        (
          await call(
            '/usuarios/' + alice,
            'PUT',
            { nome: 'X', sobrenome: 'Y', funcaoId: 1 },
            'bob@test.local'
          )
        ).status,
        403
      );
      assert.equal(
        (
          await call(
            '/equipes/' + alpha + '/membros/' + carol,
            'POST',
            {},
            'bob@test.local'
          )
        ).status,
        403
      );
      assert.equal(
        (await call('/equipes/' + alpha, 'DELETE', null, 'alice@test.local'))
          .status,
        405
      );
    }
  );
  await t.test('invalid IDs stop before writes', async () => {
    for (const id of ['abc', '0', '-1', '1.5', '9007199254740992'])
      assert.equal(
        (
          await call(
            '/tarefas/' + id,
            'PUT',
            { status: 'finalizado' },
            'alice@test.local'
          )
        ).status,
        400
      );
    assert.equal(
      (await db.query('SELECT status FROM tarefa WHERE id=$1', [task.id]))
        .rows[0].status,
      'iniciado'
    );
  });
  await t.test(
    'leader cannot leave before transferring leadership',
    async () => {
      const result = await call(
        '/equipes/' + alpha + '/sair',
        'POST',
        {},
        'alice@test.local'
      );
      assert.equal(result.status, 409);
      assert.match(result.body.error, /Transfira/);
      assert.equal(
        (
          await call(
            '/equipes/' + alpha + '/lider',
            'POST',
            { usuarioId: bob },
            'alice@test.local'
          )
        ).status,
        200
      );
      assert.equal(
        (
          await call(
            '/equipes/' + alpha + '/sair',
            'POST',
            {},
            'alice@test.local'
          )
        ).status,
        200
      );
      assert.equal(
        (await call('/tarefas/' + task.id, 'GET', null, 'alice@test.local'))
          .status,
        404
      );
    }
  );
  await t.test(
    'invites require consent and can only target users without a team',
    async () => {
      assert.equal(
        (
          await call(
            '/equipes/' + alpha + '/membros/' + carol,
            'POST',
            {},
            'bob@test.local'
          )
        ).status,
        400
      );
      assert.equal(
        (
          await call(
            '/equipes/' + alpha + '/membros/' + alice,
            'POST',
            {},
            'bob@test.local'
          )
        ).status,
        200
      );
      assert.equal(
        (await call('/sessao', 'GET', null, 'alice@test.local')).body.equipe,
        null
      );
      invite = (await call('/convites', 'GET', null, 'alice@test.local'))
        .body[0];
      assert.equal(
        (
          await call(
            '/convites/' + invite.id + '/aceitar',
            'POST',
            {},
            'alice@test.local'
          )
        ).status,
        200
      );
      assert.equal(
        (await call('/sessao', 'GET', null, 'alice@test.local')).body.equipe.id,
        alpha
      );
    }
  );
  await t.test(
    'removal revokes access immediately and clears task assignment',
    async () => {
      assert.equal(
        (
          await call(
            '/equipes/' + alpha + '/membros/' + alice,
            'DELETE',
            null,
            'bob@test.local'
          )
        ).status,
        200
      );
      assert.deepEqual(
        (await call('/projetos', 'GET', null, 'alice@test.local')).body,
        []
      );
      assert.equal(
        (
          await call(
            '/equipes/' + alpha + '/membros/' + bob,
            'DELETE',
            null,
            'bob@test.local'
          )
        ).status,
        409
      );
    }
  );
  await t.test(
    'last member must confirm deletion; team data is removed atomically',
    async () => {
      assert.equal(
        (
          await call(
            '/equipes/' + alpha + '/sair',
            'POST',
            {},
            'bob@test.local'
          )
        ).status,
        409
      );
      assert.equal(
        (
          await call(
            '/equipes/' + alpha + '/sair',
            'POST',
            { confirmarExclusao: true },
            'bob@test.local'
          )
        ).status,
        200
      );
      for (const table of ['tarefa', 'comentario'])
        assert.equal((await db.query('SELECT * FROM ' + table)).rows.length, 0);
      assert.equal(
        (await db.query('SELECT * FROM projeto WHERE id_equipe=$1', [alpha]))
          .rows.length,
        0
      );
      assert.equal(
        (await db.query('SELECT * FROM equipe WHERE id=$1', [beta])).rows
          .length,
        1
      );
    }
  );
  await t.test(
    'users without a team have no membership or resource access',
    async () => {
      assert.equal(
        (await db.query('SELECT id FROM equipe WHERE sistema')).rows.length,
        0
      );
      assert.equal(
        (
          await db.query(
            'SELECT equipe_id FROM membro_equipe WHERE usuario_id=$1',
            [bob]
          )
        ).rows.length,
        0
      );
      assert.equal(
        (await call('/sessao', 'GET', null, 'bob@test.local')).body
          .aguardandoEquipe,
        true
      );
      assert.deepEqual(
        (await call('/tarefas', 'GET', null, 'bob@test.local')).body,
        []
      );
      assert.equal(
        (
          await call(
            '/tarefas',
            'POST',
            { titulo: 'Blocked' },
            'bob@test.local'
          )
        ).status,
        403
      );
      const newTeam = await call(
        '/equipes',
        'POST',
        { nome: 'Recomeço', senha: 'password123' },
        'bob@test.local'
      );
      assert.equal(newTeam.status, 200);
      const memberships = (
        await db.query(
          'SELECT equipe_id FROM membro_equipe WHERE usuario_id=$1',
          [bob]
        )
      ).rows;
      assert.equal(memberships.length, 1);
      assert.equal(memberships[0].equipe_id, newTeam.body.id);
    }
  );
});
