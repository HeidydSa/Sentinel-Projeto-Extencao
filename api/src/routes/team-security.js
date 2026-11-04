import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.config.js';

export const positiveId = (value) => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0)
    fail(400, 'ID deve ser um inteiro positivo.');
  return id;
};
export const normalizeName = (value) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
export const isManager = (user) =>
  /^(gestor|gerente|adm|administrador)$/i.test(user.tipo);
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const text = (value, max = 200) => {
  const result = normalizeName(value);
  if (!result || result.length > max)
    fail(400, 'Preencha os campos obrigatórios dentro do limite permitido.');
  return result;
};
const password = (value) => {
  if (
    typeof value !== 'string' ||
    value.length < 8 ||
    Buffer.byteLength(value, 'utf8') > 72
  )
    fail(400, 'A senha deve ter entre 8 e 72 caracteres.');
  return value;
};
const camel = (key) =>
  key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
const serialize = (row) =>
  row &&
  Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => key !== 'senha')
      .map(([key, value]) => [
        camel(key),
        key === 'economia' ? Number(value ?? 0) : value,
      ])
  );
const publicUser = (row) => ({
  id: row.id,
  email: row.email,
  nome: row.nome,
  sobrenome: row.sobrenome,
  funcaoId: row.funcao_id,
  tipo: row.tipo,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
const one = async (db, sql, args = []) => (await db.query(sql, args)).rows[0];
const memberOf = (db, userId) =>
  one(
    db,
    'SELECT m.equipe_id FROM membro_equipe m JOIN equipe e ON e.id=m.equipe_id WHERE m.usuario_id=$1 AND NOT e.sistema',
    [userId]
  );
const actor = (db, req) =>
  one(
    db,
    'SELECT u.*, f.tipo FROM usuario u JOIN funcao f ON f.id=u.funcao_id WHERE lower(u.email)=lower($1) FOR UPDATE OF u',
    [req.user.email]
  );
const attempts = new Map();
function throttle(req) {
  const key = req.ip;
  const now = Date.now();
  for (const [address, record] of attempts)
    if (record.until < now) attempts.delete(address);
  const record = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
  record.count++;
  attempts.set(key, record);
  if (record.count > 30 || attempts.size > 10000)
    fail(429, 'Muitas tentativas. Aguarde 15 minutos.');
}
function endpoint(action, authenticated = true) {
  return async (req, res) => {
    let db;
    try {
      db = await pool.connect();
      await db.query('BEGIN');
      const user = authenticated ? await actor(db, req) : null;
      if (authenticated && !user) fail(401, 'Sessão inválida.');
      const result = await action(db, req, user);
      await db.query('COMMIT');
      if (result === undefined) return res.status(204).send();
      return res.json(result);
    } catch (error) {
      if (db) await db.query('ROLLBACK');
      if (!error.status && !['23505', '23503'].includes(error.code))
        console.error(error);
      return res
        .status(
          error.status ||
            (error.code === '23505' ? 409 : error.code === '23503' ? 400 : 500)
        )
        .json({
          error: error.status
            ? error.message
            : error.code === '23505'
              ? 'Nome completo, e-mail ou vínculo de equipe já cadastrado.'
              : error.code === '23503'
                ? 'O registro relacionado não existe ou ainda está em uso.'
                : 'Erro interno do servidor.',
        });
    } finally {
      db?.release();
    }
  };
}
async function teamFor(db, user, req, write = false) {
  if (isManager(user)) {
    if (write) fail(403, 'Gestores possuem acesso somente para consulta.');
    return req.query.equipe ? positiveId(req.query.equipe) : null;
  }
  const member = await memberOf(db, user.id);
  if (!member && write)
    fail(403, 'Entre em uma equipe para realizar alterações.');
  return member?.equipe_id ?? -1;
}
async function teamLock(db, id) {
  const team = await one(
    db,
    'SELECT * FROM equipe WHERE id=$1 AND NOT sistema FOR UPDATE',
    [positiveId(id)]
  );
  if (!team) fail(404, 'Equipe não encontrada.');
  return team;
}
async function leader(db, user, id) {
  if (isManager(user))
    fail(403, 'Gestores possuem acesso somente para consulta.');
  const team = await teamLock(db, id);
  if (team.id_lider !== user.id)
    fail(403, 'Somente o líder pode realizar esta ação.');
  return team;
}
async function enroll(db, user, teamId, secret) {
  if (isManager(user)) fail(403, 'Gestores não participam de equipes.');
  if (await memberOf(db, user.id)) fail(409, 'Você já pertence a uma equipe.');
  const team = await teamLock(db, teamId);
  if (
    typeof secret !== 'string' ||
    secret.length > 72 ||
    !team.senha ||
    !team.senha.startsWith('$2') ||
    !(await bcrypt.compare(secret, team.senha))
  )
    fail(
      400,
      'Senha da equipe incorreta. Se não possui uma equipe, crie a sua.'
    );
  await db.query(
    'INSERT INTO membro_equipe(equipe_id,usuario_id) VALUES($1,$2)',
    [team.id, user.id]
  );
  if (!team.id_lider)
    await db.query('UPDATE equipe SET id_lider=$1 WHERE id=$2', [
      user.id,
      team.id,
    ]);
  await db.query('DELETE FROM convite_equipe WHERE usuario_id=$1', [user.id]);
}
async function createTeam(db, user, payload) {
  if (isManager(user))
    fail(403, 'Gestores possuem acesso somente para consulta.');
  if (await memberOf(db, user.id))
    fail(409, 'Deixe a equipe atual antes de criar outra.');
  const hash = await bcrypt.hash(password(payload.senha), 12);
  const team = await one(
    db,
    'INSERT INTO equipe(nome,senha,id_lider) VALUES($1,$2,$3) RETURNING id,nome,id_lider',
    [text(payload.nome, 150), hash, user.id]
  );
  await db.query(
    'INSERT INTO membro_equipe(equipe_id,usuario_id) VALUES($1,$2)',
    [team.id, user.id]
  );
  return serialize(team);
}
export function publicTeamRoutes() {
  const router = Router();
  router.get(
    '/equipes-publicas',
    endpoint(
      async (db) =>
        (
          await db.query(
            'SELECT id,nome FROM equipe WHERE NOT sistema ORDER BY lower(nome),id'
          )
        ).rows,
      false
    )
  );
  router.post(
    '/auth/register',
    endpoint(async (db, req) => {
      throttle(req);
      if (
        process.env.AUTH_KEY &&
        req.headers['x-api-key'] !== process.env.AUTH_KEY
      )
        fail(403, 'Sem autorização.');
      const p = req.body;
      const role = await one(db, 'SELECT * FROM funcao WHERE id=$1', [
        positiveId(p.funcaoId),
      ]);
      if (!role || !/^(desenvolvedor|analista)$/i.test(role.tipo))
        fail(400, 'Função indisponível para cadastro público.');
      const nome = text(p.nome, 100),
        sobrenome = text(p.sobrenome, 100);
      const email = text(p.email, 255).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        fail(400, 'E-mail inválido.');
      const hash = await bcrypt.hash(password(p.senha), 12);
      const user = await one(
        db,
        'INSERT INTO usuario(nome,sobrenome,email,senha,funcao_id) VALUES($1,$2,$3,$4,$5) RETURNING *',
        [nome, sobrenome, email, hash, role.id]
      );
      if (p.novaEquipe) await createTeam(db, user, p.novaEquipe);
      else if (p.equipeId)
        await enroll(db, user, positiveId(p.equipeId), p.senhaEquipe);
      return { id: user.id };
    }, false)
  );
  return router;
}
export function secureTeamRoutes() {
  const router = Router();
  router.get(
    '/sessao',
    endpoint(async (db, req, user) => {
      const membership = await memberOf(db, user.id);
      const team =
        membership &&
        (await one(db, 'SELECT id,nome,id_lider FROM equipe WHERE id=$1', [
          membership.equipe_id,
        ]));
      return {
        ...publicUser(user),
        email: user.email,
        gestor: isManager(user),
        equipe: serialize(team) || null,
        aguardandoEquipe: !isManager(user) && !team,
      };
    })
  );
  router.get(
    '/usuarios-sem-equipe',
    endpoint(async (db, req, user) => {
      const membership = await memberOf(db, user.id);
      if (!membership) fail(403, 'Crie uma equipe primeiro.');
      await leader(db, user, membership.equipe_id);
      return (
        await db.query(
          "SELECT u.id,u.nome,u.sobrenome,f.tipo FROM usuario u JOIN funcao f ON f.id=u.funcao_id WHERE lower(f.tipo) IN ('desenvolvedor','analista') AND NOT EXISTS(SELECT 1 FROM membro_equipe m JOIN equipe e ON e.id=m.equipe_id WHERE m.usuario_id=u.id AND NOT e.sistema) ORDER BY u.nome,u.sobrenome"
        )
      ).rows;
    })
  );
  router.get(
    '/convites',
    endpoint(
      async (db, req, user) =>
        (
          await db.query(
            'SELECT c.id,e.nome,c.equipe_id FROM convite_equipe c JOIN equipe e ON e.id=c.equipe_id WHERE c.usuario_id=$1',
            [user.id]
          )
        ).rows
    )
  );
  router.post(
    '/convites/:id/aceitar',
    endpoint(async (db, req, user) => {
      if (isManager(user) || (await memberOf(db, user.id)))
        fail(409, 'Você não pode entrar nesta equipe.');
      const invite = await one(
        db,
        'SELECT * FROM convite_equipe WHERE id=$1 AND usuario_id=$2',
        [positiveId(req.params.id), user.id]
      );
      if (!invite) fail(404, 'Convite não encontrado.');
      await teamLock(db, invite.equipe_id);
      // Recheck after taking the team lock, so a revoked invite cannot be accepted.
      if (
        !(await one(db, 'SELECT id FROM convite_equipe WHERE id=$1', [
          invite.id,
        ]))
      )
        fail(404, 'Convite revogado.');
      await db.query(
        'INSERT INTO membro_equipe(equipe_id,usuario_id) VALUES($1,$2)',
        [invite.equipe_id, user.id]
      );
      await db.query('DELETE FROM convite_equipe WHERE usuario_id=$1', [
        user.id,
      ]);
      return { ok: true };
    })
  );
  router.delete(
    '/convites/:id',
    endpoint(async (db, req, user) => {
      await db.query(
        'DELETE FROM convite_equipe WHERE id=$1 AND usuario_id=$2',
        [positiveId(req.params.id), user.id]
      );
    })
  );
  router.post(
    '/equipes',
    endpoint((db, req, user) => createTeam(db, user, req.body))
  );
  router.post(
    '/equipes/:id/entrar',
    endpoint(async (db, req, user) => {
      throttle(req);
      await enroll(db, user, positiveId(req.params.id), req.body.senha);
      return { ok: true };
    })
  );
  router.post(
    '/equipes/:id/sair',
    endpoint(async (db, req, user) => {
      if (isManager(user)) fail(403, 'Gestores não participam de equipes.');
      const team = await teamLock(db, req.params.id);
      const membership = await memberOf(db, user.id);
      if (membership?.equipe_id !== team.id)
        fail(403, 'Você não pertence a esta equipe.');
      const members = (
        await db.query(
          'SELECT usuario_id FROM membro_equipe WHERE equipe_id=$1',
          [team.id]
        )
      ).rows;
      if (members.length > 1 && team.id_lider === user.id)
        fail(409, 'Transfira a liderança antes de deixar a equipe.');
      if (members.length === 1) {
        if (req.body.confirmarExclusao !== true)
          fail(
            409,
            'Você é o último integrante. Todos os dados da equipe serão perdidos. Confirme para continuar.'
          );
        // Explicit deletes also cover records created before the new cascade columns.
        await db.query(
          'DELETE FROM tarefa WHERE id_equipe=$1 OR id_projeto IN(SELECT id FROM projeto WHERE id_equipe=$1)',
          [team.id]
        );
        await db.query('DELETE FROM projeto WHERE id_equipe=$1', [team.id]);
        await db.query('DELETE FROM andamento_tarefa WHERE id_equipe=$1', [
          team.id,
        ]);
        await db.query('DELETE FROM equipe WHERE id=$1', [team.id]);
      } else {
        await db.query(
          'UPDATE tarefa SET id_responsavel=NULL WHERE id_equipe=$1 AND id_responsavel=$2',
          [team.id, user.id]
        );
        await db.query('DELETE FROM membro_equipe WHERE usuario_id=$1', [
          user.id,
        ]);
      }
      return { ok: true };
    })
  );
  router.post(
    '/equipes/:id/lider',
    endpoint(async (db, req, user) => {
      const team = await leader(db, user, req.params.id);
      const target = positiveId(req.body.usuarioId);
      if (
        !(await one(
          db,
          'SELECT 1 FROM membro_equipe WHERE equipe_id=$1 AND usuario_id=$2',
          [team.id, target]
        ))
      )
        fail(400, 'Escolha um integrante da equipe.');
      await db.query('UPDATE equipe SET id_lider=$1 WHERE id=$2', [
        target,
        team.id,
      ]);
      return { ok: true };
    })
  );
  router.put(
    '/equipes/:id',
    endpoint(async (db, req, user) => {
      const team = await leader(db, user, req.params.id);
      const hash = req.body.senha
        ? await bcrypt.hash(password(req.body.senha), 12)
        : team.senha;
      await db.query('UPDATE equipe SET nome=$1,senha=$2 WHERE id=$3', [
        text(req.body.nome ?? team.nome, 150),
        hash,
        team.id,
      ]);
      return { ok: true };
    })
  );
  router.post(
    '/equipes/:equipeId/membros/:usuarioId',
    endpoint(async (db, req, user) => {
      const team = await leader(db, user, req.params.equipeId);
      const target = positiveId(req.params.usuarioId);
      const candidate = await one(
        db,
        'SELECT u.id,f.tipo FROM usuario u JOIN funcao f ON f.id=u.funcao_id WHERE u.id=$1',
        [target]
      );
      if (!candidate || isManager(candidate) || (await memberOf(db, target)))
        fail(400, 'Usuário indisponível.');
      await db.query(
        'INSERT INTO convite_equipe(equipe_id,usuario_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
        [team.id, target]
      );
      return {
        ok: true,
        message: 'Convite enviado. O usuário precisa aceitar.',
      };
    })
  );
  router.delete(
    '/equipes/:equipeId/membros/:usuarioId',
    endpoint(async (db, req, user) => {
      const team = await leader(db, user, req.params.equipeId);
      const target = positiveId(req.params.usuarioId);
      if (target === team.id_lider)
        fail(409, 'Transfira a liderança antes de remover o líder.');
      await db.query(
        'UPDATE tarefa SET id_responsavel=NULL WHERE id_equipe=$1 AND id_responsavel=$2',
        [team.id, target]
      );
      await db.query(
        'DELETE FROM membro_equipe WHERE equipe_id=$1 AND usuario_id=$2',
        [team.id, target]
      );
      await db.query(
        'DELETE FROM convite_equipe WHERE equipe_id=$1 AND usuario_id=$2',
        [team.id, target]
      );
      return { ok: true };
    })
  );
  router.get(
    '/equipes/:equipeId/membros',
    endpoint(async (db, req, user) => {
      const id = positiveId(req.params.equipeId);
      await teamLock(db, id);
      if (!isManager(user) && (await memberOf(db, user.id))?.equipe_id !== id)
        fail(403, 'Sem acesso à equipe.');
      return (
        await db.query(
          'SELECT u.id,u.nome,u.sobrenome,u.funcao_id,f.tipo FROM usuario u JOIN funcao f ON f.id=u.funcao_id JOIN membro_equipe m ON m.usuario_id=u.id WHERE m.equipe_id=$1 ORDER BY u.nome,u.sobrenome',
          [id]
        )
      ).rows.map(publicUser);
    })
  );
  router.get(
    '/equipes',
    endpoint(async (db, req, user) => {
      const team = await teamFor(db, user, req);
      return (
        await db.query(
          'SELECT id,nome,id_lider,created_at,updated_at FROM equipe WHERE NOT sistema AND ($1::integer IS NULL OR id=$1)',
          [team]
        )
      ).rows.map(serialize);
    })
  );
  router.get(
    '/usuarios',
    endpoint(async (db, req, user) => {
      const team = await teamFor(db, user, req);
      return (
        await db.query(
          'SELECT DISTINCT u.id,u.email,u.nome,u.sobrenome,u.funcao_id,u.created_at,u.updated_at FROM usuario u LEFT JOIN membro_equipe m ON m.usuario_id=u.id WHERE $1::integer IS NULL OR m.equipe_id=$1 OR u.id=$2',
          [team, user.id]
        )
      ).rows.map(publicUser);
    })
  );
  router.put(
    '/usuarios/:id',
    endpoint(async (db, req, user) => {
      if (positiveId(req.params.id) !== user.id)
        fail(403, 'Você só pode editar o próprio perfil.');
      const p = req.body;
      await db.query('UPDATE usuario SET nome=$1,sobrenome=$2 WHERE id=$3', [
        text(p.nome, 100),
        text(p.sobrenome, 100),
        user.id,
      ]);
      return {
        ...publicUser(user),
        nome: normalizeName(p.nome),
        sobrenome: normalizeName(p.sobrenome),
      };
    })
  );
  router.delete(
    '/usuarios/:id',
    endpoint(async (db, req, user) => {
      if (positiveId(req.params.id) !== user.id)
        fail(403, 'Você só pode excluir o próprio perfil.');
      if (await memberOf(db, user.id))
        fail(409, 'Deixe a equipe antes de excluir sua conta.');
      await db.query('DELETE FROM usuario WHERE id=$1', [user.id]);
    })
  );
  router.get(
    '/funcoes',
    endpoint(async (db) =>
      (await db.query('SELECT * FROM funcao ORDER BY id')).rows.map(serialize)
    )
  );

  const resources = {
    projetos: { table: 'projeto', fields: ['titulo', 'descricao', 'status'] },
    tarefas: {
      table: 'tarefa',
      fields: [
        'titulo',
        'data',
        'economia',
        'descricao',
        'status',
        'id_projeto',
        'id_criador',
        'id_responsavel',
        'id_andamento',
      ],
    },
    andamentos: { table: 'andamento_tarefa', fields: ['titulo', 'ordem'] },
  };
  async function resource(db, req, user, name) {
    const config = resources[name],
      write = req.method !== 'GET';
    const team = await teamFor(db, user, req, write);
    if (write) {
      await teamLock(db, team);
      if ((await memberOf(db, user.id))?.equipe_id !== team)
        fail(403, 'Seu vínculo com a equipe mudou.');
    }
    const id = req.params.id ? positiveId(req.params.id) : null;
    let current;
    if (id) {
      current = await one(
        db,
        'SELECT * FROM ' +
          config.table +
          ' WHERE id=$1 AND ($2::integer IS NULL OR id_equipe=$2)',
        [id, team]
      );
      if (!current) fail(404, 'Registro não encontrado nesta equipe.');
    }
    if (req.method === 'GET')
      return current
        ? serialize(current)
        : (
            await db.query(
              'SELECT * FROM ' +
                config.table +
                ' WHERE $1::integer IS NULL OR id_equipe=$1 ORDER BY id',
              [team]
            )
          ).rows.map(serialize);
    if (req.method === 'DELETE') {
      await db.query('DELETE FROM ' + config.table + ' WHERE id=$1', [id]);
      return;
    }
    const p = req.body,
      data = {};
    for (const field of config.fields) {
      const key = camel(field);
      data[field] = p[key] === undefined ? (current?.[field] ?? null) : p[key];
    }
    data.titulo = text(data.titulo);
    if ('descricao' in data) {
      if (data.descricao != null && typeof data.descricao !== 'string')
        fail(400, 'Descrição inválida.');
      data.descricao = (data.descricao || '').slice(0, 10000);
    }
    if ('status' in data) {
      const statuses =
        name === 'tarefas'
          ? ['afazer', 'pendente', 'iniciado', 'finalizado', 'espera']
          : [
              'ativo',
              'em_producao',
              'nao_iniciado',
              'finalizado',
              'pausado',
              'cancelado',
            ];
      data.status ||= name === 'tarefas' ? 'afazer' : 'ativo';
      if (!statuses.includes(data.status)) fail(400, 'Status inválido.');
    }
    if (name === 'andamentos') {
      data.ordem = Number(data.ordem ?? 0);
      if (!Number.isSafeInteger(data.ordem) || data.ordem < 0)
        fail(400, 'Ordem inválida.');
    }
    if (name === 'tarefas') {
      data.economia = Number(data.economia ?? 0);
      if (
        !Number.isFinite(data.economia) ||
        data.economia < 0 ||
        data.economia > 9999999999.99
      )
        fail(400, 'Gastos inválidos.');
      if (
        data.data &&
        (typeof data.data !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(data.data) ||
          !Number.isFinite(Date.parse(data.data)))
      )
        fail(400, 'Data inválida.');
      if (data.data) {
        data.data = data.data.slice(0, 10);
        const date = new Date(data.data + 'T00:00:00Z');
        if (
          !Number.isFinite(date.getTime()) ||
          date.toISOString().slice(0, 10) !== data.data
        )
          fail(400, 'Data inválida.');
      }
      data.id_criador = current?.id_criador ?? user.id;
      for (const [field, table] of [
        ['id_projeto', 'projeto'],
        ['id_andamento', 'andamento_tarefa'],
      ]) {
        if (data[field] != null) {
          data[field] = positiveId(data[field]);
          if (
            !(await one(
              db,
              'SELECT id FROM ' + table + ' WHERE id=$1 AND id_equipe=$2',
              [data[field], team]
            ))
          )
            fail(400, 'Relacionamento fora da equipe.');
        }
      }
      if (data.id_responsavel != null) {
        data.id_responsavel = positiveId(data.id_responsavel);
        if ((await memberOf(db, data.id_responsavel))?.equipe_id !== team)
          fail(400, 'Responsável não pertence à equipe.');
      }
    }
    const fields = [...config.fields, 'id_equipe'],
      values = [...config.fields.map((field) => data[field]), team];
    const sql = current
      ? 'UPDATE ' +
        config.table +
        ' SET ' +
        fields.map((field, i) => field + '=$' + (i + 1)).join(',') +
        ' WHERE id=$' +
        (values.length + 1) +
        ' RETURNING *'
      : 'INSERT INTO ' +
        config.table +
        '(' +
        fields.join(',') +
        ') VALUES(' +
        values.map((_, i) => '$' + (i + 1)).join(',') +
        ') RETURNING *';
    return serialize(await one(db, sql, current ? [...values, id] : values));
  }
  for (const name of Object.keys(resources)) {
    router.get(
      '/' + name,
      endpoint((db, req, user) => resource(db, req, user, name))
    );
    router.post(
      '/' + name,
      endpoint((db, req, user) => resource(db, req, user, name))
    );
    for (const method of ['get', 'put', 'delete'])
      router[method](
        '/' + name + '/:id',
        endpoint((db, req, user) => resource(db, req, user, name))
      );
  }
  async function comments(db, req, user) {
    const write = req.method !== 'GET',
      team = await teamFor(db, user, req, write);
    if (write) {
      await teamLock(db, team);
      if ((await memberOf(db, user.id))?.equipe_id !== team)
        fail(403, 'Seu vínculo com a equipe mudou.');
    }
    const task = await one(
      db,
      'SELECT id FROM tarefa WHERE id=$1 AND ($2::integer IS NULL OR id_equipe=$2)',
      [positiveId(req.params.tarefaId), team]
    );
    if (!task) fail(404, 'Tarefa não encontrada nesta equipe.');
    const id = req.params.comentarioId
      ? positiveId(req.params.comentarioId)
      : null;
    if (req.method === 'POST')
      return serialize(
        await one(
          db,
          'INSERT INTO comentario(id_tarefa,id_usuario,detalhe) VALUES($1,$2,$3) RETURNING *',
          [task.id, user.id, text(req.body.detalhe, 10000)]
        )
      );
    if (id) {
      const comment = await one(
        db,
        'SELECT * FROM comentario WHERE id=$1 AND id_tarefa=$2',
        [id, task.id]
      );
      if (!comment) fail(404, 'Comentário não encontrado.');
      if (req.method === 'DELETE') {
        const teamRow = await teamLock(db, team);
        if (comment.id_usuario !== user.id && teamRow.id_lider !== user.id)
          fail(403, 'Somente o autor ou líder pode remover o comentário.');
        await db.query('DELETE FROM comentario WHERE id=$1', [id]);
        return;
      }
      return serialize(comment);
    }
    return (
      await db.query(
        'SELECT * FROM comentario WHERE id_tarefa=$1 ORDER BY created_at',
        [task.id]
      )
    ).rows.map(serialize);
  }
  router.get('/tarefas/:tarefaId/comentarios', endpoint(comments));
  router.post('/tarefas/:tarefaId/comentarios', endpoint(comments));
  router.get(
    '/tarefas/:tarefaId/comentarios/:comentarioId',
    endpoint(comments)
  );
  router.delete(
    '/tarefas/:tarefaId/comentarios/:comentarioId',
    endpoint(comments)
  );
  // Do not fall through to the legacy, unscoped CRUD routes.
  router.use((req, res) =>
    res.status(405).json({ error: 'Operação indisponível.' })
  );
  return router;
}
