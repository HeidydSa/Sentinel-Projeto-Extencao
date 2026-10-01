import express from 'express';

import { pool } from './config/db.js';
import { buildRoutes } from './routes/index.js';

import { createFuncao } from './create/createFuncao.js';
import { createUsuario } from './create/createUsuario.js';
import { createEquipe } from './create/createEquipe.js';
import { createMembroEquipe } from './create/createMembroEquipe.js';
import { createProjeto } from './create/createProjeto.js';
import { createAndamentoTarefa } from './create/createAndamentoTarefa.js';
import { createTarefa } from './create/createTarefa.js';
import { createComentario } from './create/createComentario.js';

const app = express();
app.use(express.json());

const controllers = {
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
