import { Router } from 'express';

import { buildFuncaoRoutes } from './funcoes.routes.js';
import { buildUsuarioRoutes } from './usuarios.routes.js';
import { buildEquipeRoutes } from './equipes.routes.js';
import { buildMembroEquipeRoutes } from './membro_equipe.routes.js';
import { buildProjetoRoutes } from './projetos.routes.js';
import { buildAndamentoTarefaRoutes } from './andamento_tarefas.routes.js';
import { buildTarefaRoutes } from './tarefas.routes.js';
import { buildComentarioRoutes } from './comentarios.routes.js';
import { buildAuthRoutes } from './auth.routes.js';
import { jwtValidator } from '../middleware/jwt_validator..middleware.js';

export function buildRoutes({ controllers }) {
  const router = Router();

  router.use(buildAuthRoutes({ controllers }));

  router.use(jwtValidator);
  router.use(buildFuncaoRoutes({ controllers }));
  router.use(buildUsuarioRoutes({ controllers }));
  router.use(buildEquipeRoutes({ controllers }));
  router.use(buildMembroEquipeRoutes({ controllers }));
  router.use(buildProjetoRoutes({ controllers }));
  router.use(buildAndamentoTarefaRoutes({ controllers }));
  router.use(buildTarefaRoutes({ controllers }));
  router.use(buildComentarioRoutes({ controllers }));

  return router;
}
