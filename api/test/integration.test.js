import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import express from 'express';
import { JSDOM } from 'jsdom';
import { Pool } from 'pg';
import { newDb } from 'pg-mem';
import { buildRoutes } from '../src/routes/index.js';
import { createAuth } from '../src/composition/create_auth.js';
import { createUsuario } from '../src/composition/create_usuario.js';
import { createProjeto } from '../src/composition/create_projeto.js';
import { createTarefa } from '../src/composition/create_tarefa.js';
import { createComentario } from '../src/composition/create_comentario.js';
import { createEquipe } from '../src/composition/create_equipe.js';
import { createFuncao } from '../src/composition/create_funcao.js';
import { createAndamentoTarefa } from '../src/composition/create_andamento_tarefa.js';
import { createMembroEquipe } from '../src/composition/create_membro_equipe.js';
import { TarefaRepository } from '../src/repositories/tarefas.repository.js';
import {
  dashboardData,
  renderDashboard,
} from '../../WEB/src/features/estatisticas/dashboard.js';
import { global as config } from '../../WEB/src/config/global.js';

// Exercita os SQLs reais dos repositories. pg-mem não implementa triggers PL/pgSQL;
// os triggers de updated_at e a extensão opcional não fazem parte desta verificação.
test('frontend → HTTP → API → SQL, sem acessar o Supabase de produção', async (t) => {
  const memory = newDb({ autoCreateForeignKeyIndices: true });
  const schema = (
    await readFile(new URL('../src/create.sql', import.meta.url), 'utf8')
  )
    .replace(/CREATE EXTENSION[^;]+;/g, '')
    .replace(/CREATE OR REPLACE FUNCTION[\s\S]*?\$\$ LANGUAGE plpgsql;/g, '')
    .replace(/CREATE TRIGGER[\s\S]*?EXECUTE FUNCTION set_updated_at\(\);/g, '');
  memory.public.none(schema);
  memory.public.none("INSERT INTO funcao (tipo) VALUES ('Dev'), ('Admin')");
  const MemoryPool = memory.adapters.createPg().Pool;
  const memoryPool = new MemoryPool();
  const pool = new Pool();
  pool.query = (...args) => memoryPool.query(...args);
  process.env.JWT_SECRET = 'segredo-exclusivo-do-teste-local';
  const controllers = {
    auth: createAuth(pool),
    usuario: createUsuario(pool),
    projeto: createProjeto(pool),
    tarefa: createTarefa(pool),
    comentario: createComentario(pool),
    equipe: createEquipe(pool),
    funcao: createFuncao(pool),
    andamentoTarefa: createAndamentoTarefa(pool),
    membroEquipe: createMembroEquipe(pool),
  };
  const app = express();
  app.use(express.json());
  app.get('/unavailable', (_req, res) =>
    res.status(502).send('<html>Bad Gateway</html>')
  );
  app.use(buildRoutes({ controllers }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
    await memoryPool.end();
  });
  config.API_URL = 'http://127.0.0.1:' + server.address().port;
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  globalThis.document = { getElementById: () => null };
  const {
    authService,
    projetosService,
    tarefasService,
    usuariosService,
    comentarioService,
  } = await import('../../WEB/src/config/container.js');
  const session = await import('../../WEB/src/config/session.js');
  const { getState } = await import('../../WEB/src/state.js');
  const { Projeto } = await import('../../WEB/src/models/Projeto.model.js');
  const { Tarefa } = await import('../../WEB/src/models/Tarefa.model.js');
  const { Comentario } =
    await import('../../WEB/src/models/Comentario.model.js');
  const { BaseClient } = await import('../../WEB/src/client/base.client.js');
  const signup = {
    nome: 'Pessoa',
    sobrenome: 'Teste',
    email: 'teste@example.invalid',
    senha: 'SenhaTeste123',
    funcaoId: 1,
  };
  let user, project, task;
  await t.test(
    'cadastro usa funções SQL, grava senha hash e bloqueia função administrativa',
    async () => {
      assert.deepEqual(await authService.roles(), [{ id: 1, tipo: 'Dev' }]);
      await assert.rejects(
        authService.register({ ...signup, funcaoId: 2 }),
        /Função inválida/
      );
      const result = await authService.register(signup);
      assert.equal(result.id, 1);
      const row = memory.public.one('SELECT * FROM usuario WHERE id = 1');
      assert.notEqual(row.senha, signup.senha);
      assert.match(row.senha, /^\$2/);
      await assert.rejects(authService.register(signup), /já cadastrado/);
    }
  );
  await t.test(
    'login valida senha, perfil vem do SQL e respostas não expõem senha',
    async () => {
      await assert.rejects(session.login(signup.email, 'errada'), /inválidos/);
      user = await session.login(signup.email, signup.senha);
      assert.equal(user.uid, '1');
      assert.equal(user.nome, signup.nome);
      assert.equal('senha' in user, false);
      assert.ok(localStorage.getItem('auth_token'));
    }
  );
  await t.test(
    'criação e edição de projeto persistem e são relidas do SQL',
    async () => {
      project = await projetosService.create(
        new Projeto({ titulo: 'Projeto do banco', status: 'em_producao' })
      );
      assert.equal(project.id, '1');
      project.titulo = 'Projeto editado';
      await projetosService.update(project.id, project);
      assert.equal(
        (await projetosService.getById(project.id)).titulo,
        'Projeto editado'
      );
      assert.equal(
        memory.public.one('SELECT * FROM projeto WHERE id = 1').titulo,
        'Projeto editado'
      );
    }
  );
  await t.test(
    'tarefas preservam IDs, valores monetários, datas e responsável após leitura',
    async () => {
      task = await tarefasService.create(
        new Tarefa({
          titulo: 'Tarefa SQL',
          data: '2026-01-15',
          economia: 1234.56,
          status: 'afazer',
          idProjeto: project.id,
          idCriador: user.uid,
          idResponsavel: user.uid,
        })
      );
      assert.equal(task.id, '1');
      task.status = 'finalizado';
      task.economia = 2000.25;
      await tarefasService.update(task.id, task);
      const saved = await tarefasService.getById(task.id);
      assert.equal(saved.status, 'finalizado');
      assert.equal(saved.economia, 2000.25);
      const state = await getState();
      assert.equal(state.tarefas[0].responsavel.getInitials(), 'PT');
      assert.equal(state.tarefas[0].data instanceof Date, true);
    }
  );
  await t.test(
    'comentários gravam no SQL, são relidos e excluídos com resposta 204',
    async () => {
      const commentId = await comentarioService.create(
        task.id,
        new Comentario({
          idUsuario: Number(user.uid),
          detalhe: 'Comentário do teste',
        })
      );
      assert.equal((await comentarioService.getAll(task.id))[0].id, commentId);
      await comentarioService.delete(task.id, commentId);
      assert.deepEqual(await comentarioService.getAll(task.id), []);
    }
  );
  await t.test(
    'gráficos calculam valores do SQL e filtros removem dados fora do período',
    async () => {
      const state = await getState();
      const data = dashboardData(state, { quarter: 0, year: 2026 });
      assert.equal(data.total, 2000.25);
      assert.equal(data.taskCounts[0], 1);
      assert.equal(
        dashboardData(state, { quarter: 1, year: 2026 }).tasks.length,
        0
      );
      const html = renderDashboard(data, { year: 2026 });
      assert.match(html, /Projeto editado/);
      assert.match(html, /2.000,25/);
      assert.doesNotMatch(html, /27.000/);
    }
  );
  await t.test(
    'perfil salva no SQL mantendo a senha e sem permitir mudar função',
    async () => {
      const old = memory.public.one('SELECT * FROM usuario WHERE id = 1').senha;
      await session.updateProfile(session.auth.currentUser, {
        displayName: 'Nome Atualizado',
      });
      const row = memory.public.one('SELECT * FROM usuario WHERE id = 1');
      assert.equal(row.nome, 'Nome');
      assert.equal(row.sobrenome, 'Atualizado');
      assert.equal(row.senha, old);
      const users = await usuariosService.getAll();
      assert.equal(users[0].nome, 'Nome');
      await session.login(signup.email, signup.senha);
    }
  );
  await t.test(
    'IDs inválidos não executam exclusões e erros 502 não viram senha inválida',
    async () => {
      await assert.rejects(tarefasService.delete('invalido'), /inteiro/);
      assert.equal((await tarefasService.getAll()).length, 1);
      await assert.rejects(
        new BaseClient({ path: '/unavailable' }).getAll(),
        /indisponível/
      );
    }
  );
  await t.test(
    'formulários e telas reais usam a API e exibem dados salvos',
    async () => {
      const pages = [];
      async function page(name) {
        const html = await readFile(
          new URL(
            '../../WEB/src/features/' + name + '/' + name + '.html',
            import.meta.url
          ),
          'utf8'
        );
        const dom = new JSDOM(html, {
          url: config.API_URL + '/features/' + name + '/' + name + '.html',
        });
        pages.push(dom);
        globalThis.window = dom.window;
        globalThis.document = dom.window.document;
        globalThis.Option = dom.window.Option;
        globalThis.FormData = dom.window.FormData;
        globalThis.location = {
          href: '',
          replace(value) {
            this.href = value;
          },
        };
        return import('../../WEB/src/features/' + name + '/' + name + '.js');
      }
      async function until(predicate) {
        for (let i = 0; i < 100; i++) {
          if (predicate()) return;
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        assert.fail('A tela não terminou de atualizar.');
      }
      try {
        await page('login');
        document.getElementById('email').value = signup.email;
        document.getElementById('senha_login').value = signup.senha;
        await document.getElementById('login-btn').onclick();
        assert.equal(location.href, '../tarefas/tarefas.html');
        assert.equal(document.getElementById('senha-error').textContent, '');

        await page('cadastro');
        await until(
          () => document.getElementById('funcao-select').options.length > 1
        );
        for (const [id, value] of Object.entries({
          nome: 'Cadastro',
          sobrenome: 'Pela Tela',
          email: 'tela@example.invalid',
          senha: 'SenhaDaTela123',
        }))
          document.getElementById(id).value = value;
        document.getElementById('funcao-select').value = '1';
        await document.getElementById('cadastroButton').onclick();
        assert.equal(
          memory.public.one(
            "SELECT * FROM usuario WHERE email = 'tela@example.invalid'"
          ).nome,
          'Cadastro'
        );
        assert.equal(document.getElementById('atributo-error').textContent, '');

        const projectsPage = await page('projetos');
        await projectsPage.render();
        assert.match(
          document.getElementById('projetos-grid').textContent,
          /Projeto editado/
        );
        const projectForm = document.querySelector(
          '#modal-create-project form'
        );
        projectForm.elements.namedItem('titulo').value =
          'Projeto pelo formulário';
        projectForm.elements.namedItem('descricao').value = 'Descrição';
        projectForm.elements.namedItem('status').value = 'em_producao';
        await window.onCreate({ preventDefault() {}, target: projectForm });
        await until(() =>
          document
            .getElementById('projetos-grid')
            .textContent.includes('Projeto pelo formulário')
        );
        const created = memory.public.one(
          "SELECT * FROM projeto WHERE titulo = 'Projeto pelo formulário'"
        );
        await window.onDelete(String(created.id));

        const tasksPage = await page('tarefas');
        await tasksPage.render();
        assert.match(
          document.getElementById('kanban-board').textContent,
          /Tarefa SQL/
        );
        await window.openCreateTask();
        const taskForm = document.querySelector('#modal-create-task form');
        for (const [name, value] of Object.entries({
          titulo: 'Tarefa pelo formulário',
          data: '2026-03-12',
          economia: '50.75',
          descricao: 'Descrição',
          idResponsavel: user.uid,
          idProjeto: project.id,
        }))
          taskForm.elements.namedItem(name).value = value;
        await window.saveCreateTask({ preventDefault() {}, target: taskForm });
        assert.match(
          document.getElementById('kanban-board').textContent,
          /Tarefa pelo formulário/
        );
        const saved = memory.public.one(
          "SELECT * FROM tarefa WHERE titulo = 'Tarefa pelo formulário'"
        );
        assert.equal(Number(saved.economia), 50.75);
        await tarefasService.delete(String(saved.id));

        await page('estatisticas');
        await until(() => !document.getElementById('stats-dashboard').hidden);
        assert.equal(document.querySelectorAll('.stats-card').length, 6);
        assert.match(
          document.getElementById('stats-dashboard').textContent,
          /Projeto editado/
        );
        assert.match(
          document.getElementById('stats-dashboard').textContent,
          /2.000,25/
        );
        document.querySelector('[data-quarter="1"]').onclick();
        document.getElementById('stats-year').value = '2026';
        document.getElementById('stats-year').onchange();
        assert.equal(
          document.querySelectorAll('.stats-card strong')[2].textContent,
          '0'
        );
        memory.public.none(
          "DELETE FROM usuario WHERE email = 'tela@example.invalid'"
        );
      } finally {
        pages.forEach((dom) => dom.window.close());
        delete globalThis.window;
        globalThis.document = { getElementById: () => null };
      }
    }
  );
  await t.test(
    'exclusões persistem no SQL e sessão inválida não permite leituras',
    async () => {
      await tarefasService.delete(task.id);
      await projetosService.delete(project.id);
      assert.deepEqual(await tarefasService.getAll(), []);
      assert.deepEqual(await projetosService.getAll(), []);
      await session.deleteUser(session.auth.currentUser);
      assert.equal(memory.public.many('SELECT * FROM usuario').length, 0);
      assert.equal(localStorage.getItem('auth_token'), null);
      await assert.rejects(tarefasService.getAll(), /autenticação/);
    }
  );
});

test('NUMERIC do PostgreSQL é convertido antes da validação do modelo', () => {
  const repository = new TarefaRepository({});
  const task = repository.fromPersisted({
    id: 1,
    titulo: 'Teste',
    economia: '1500.50',
  });
  assert.equal(task.economia, 1500.5);
});

test('status atrasado considera prazo e não marca concluídas como atrasadas', () => {
  const state = {
    projetos: [],
    tarefas: [
      { status: 'finalizado', data: new Date(2020, 0, 1), economia: 0 },
      { status: 'iniciado', data: new Date(2020, 0, 1), economia: 0 },
    ],
  };
  assert.deepEqual(
    dashboardData(state, { now: new Date(2026, 0, 1) }).taskCounts,
    [1, 0, 1, 0]
  );
});
