import express from 'express';

import { pool } from './config/db.config.js';
import { buildRoutes } from './routes/index.js';

import { createFuncao } from './composition/create_funcao.js';
import { createUsuario } from './composition/create_usuario.js';
import { createEquipe } from './composition/create_equipe.js';
import { createMembroEquipe } from './composition/create_membro_equipe.js';
import { createProjeto } from './composition/create_projeto.js';
import { createAndamentoTarefa } from './composition/create_andamento_tarefa.js';
import { createTarefa } from './composition/create_tarefa.js';
import { createComentario } from './composition/create_comentario.js';
import { createAuth } from './composition/create_auth.js';

const app = express();
app.use(express.json());

const controllers = {
  auth: createAuth(pool),
  funcao: createFuncao(pool),
  usuario: createUsuario(pool),
  equipe: createEquipe(pool),
  membroEquipe: createMembroEquipe(pool),
  projeto: createProjeto(pool),
  andamentoTarefa: createAndamentoTarefa(pool),
  tarefa: createTarefa(pool),
  comentario: createComentario(pool),
};

app.use(buildRoutes({ controllers }));

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
