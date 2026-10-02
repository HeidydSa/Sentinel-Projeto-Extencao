import { Router } from 'express';

export function buildFuncaoRoutes({ controllers }) {
  const router = Router();

  router.post('/funcoes', controllers.funcao.create.bind(controllers.funcao));
  router.get('/funcoes', controllers.funcao.getAll.bind(controllers.funcao));
  router.get(
    '/funcoes/:id',
    controllers.funcao.getById.bind(controllers.funcao)
  );
  router.put(
    '/funcoes/:id',
    controllers.funcao.update.bind(controllers.funcao)
  );
  router.delete(
    '/funcoes/:id',
    controllers.funcao.delete.bind(controllers.funcao)
  );

  return router;
}
