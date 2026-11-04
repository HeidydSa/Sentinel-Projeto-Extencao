import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const schema = () =>
  fs.readFile(new URL('../src/create.sql', import.meta.url), 'utf8');
const migration = () =>
  fs.readFile(
    new URL('../migrations/20261104_equipes.sql', import.meta.url),
    'utf8'
  );

test('legacy migration preserves ownership and splits shared progress by team', async () => {
  const db = new PGlite();
  try {
    await db.exec(
      (await schema()).replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '')
    );
    await db.exec(
      "INSERT INTO funcao(id,tipo) VALUES(3,'Desenvolvedor'); INSERT INTO usuario(id,nome,sobrenome,email,senha,funcao_id) VALUES(1,'Alice','Teste','a@test.local','x',3),(2,'Bob','Teste','b@test.local','x',3); INSERT INTO equipe(id,nome,id_lider) VALUES(1,'Alpha',1),(2,'Beta',2); SELECT setval('equipe_id_seq',2); INSERT INTO projeto(id,titulo,id_equipe) VALUES(1,'Alpha project',1),(2,'Beta project',2); INSERT INTO andamento_tarefa(id,titulo,ordem) VALUES(1,'Shared progress',0); SELECT setval('andamento_tarefa_id_seq',1); INSERT INTO tarefa(id,titulo,id_projeto,id_criador,id_responsavel,id_andamento) VALUES(1,'Alpha task',1,1,2,1),(2,'Beta task',2,2,2,1),(3,'Unknown team',NULL,NULL,NULL,NULL)"
    );
    await db.exec(await migration());
    const tasks = (await db.query('SELECT * FROM tarefa ORDER BY id')).rows;
    assert.equal(tasks[0].id_equipe, 1);
    assert.equal(tasks[1].id_equipe, 2);
    assert.equal(tasks[2].id_equipe, null);
    assert.equal(tasks[0].id_responsavel, null);
    assert.notEqual(tasks[0].id_andamento, tasks[1].id_andamento);
    for (const task of tasks.slice(0, 2)) {
      const progress = (
        await db.query('SELECT id_equipe FROM andamento_tarefa WHERE id=$1', [
          task.id_andamento,
        ])
      ).rows[0];
      assert.equal(progress.id_equipe, task.id_equipe);
    }
    assert.equal(
      (await db.query('SELECT * FROM membro_equipe')).rows.length,
      2
    );
    await db.exec(await migration());
    assert.equal(
      (await db.query('SELECT * FROM andamento_tarefa')).rows.length,
      3
    );
    await assert.rejects(
      db.query('INSERT INTO membro_equipe(equipe_id,usuario_id) VALUES(2,1)'),
      /unique/i
    );
  } finally {
    await db.close();
  }
});
test('duplicate full names cancel the migration without partial schema changes', async () => {
  const db = new PGlite();
  try {
    await db.exec(
      (await schema()).replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '')
    );
    await db.exec(
      "INSERT INTO funcao(id,tipo) VALUES(3,'Desenvolvedor'); INSERT INTO usuario(nome,sobrenome,email,senha,funcao_id) VALUES('Alice','Teste','a@test.local','x',3),('alice',' TESTE ','b@test.local','x',3)"
    );
    await assert.rejects(db.exec(await migration()), /unique/i);
    await db.exec('ROLLBACK');
    assert.equal(
      (
        await db.query(
          "SELECT column_name FROM information_schema.columns WHERE table_name='tarefa' AND column_name='id_equipe'"
        )
      ).rows.length,
      0
    );
  } finally {
    await db.close();
  }
});
