import { Router } from 'express';

export function buildProjetoRoutes({ controllers }) {
  const router = Router();

  router.post(
    '/projetos',
    controllers.projeto.create.bind(controllers.projeto)
  );
  router.get('/projetos', controllers.projeto.getAll.bind(controllers.projeto));
  router.get(
    '/projetos/:id',
    controllers.projeto.getById.bind(controllers.projeto)
  );
  router.put(
    '/projetos/:id',
    controllers.projeto.update.bind(controllers.projeto)
  );
  router.delete(
    '/projetos/:id',
    controllers.projeto.delete.bind(controllers.projeto)
  );

  return router;
}
