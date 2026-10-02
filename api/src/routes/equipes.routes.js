import { Router } from 'express';

export function buildEquipeRoutes({ controllers }) {
  const router = Router();

  router.post('/equipes', controllers.equipe.create.bind(controllers.equipe));
  router.get('/equipes', controllers.equipe.getAll.bind(controllers.equipe));
  router.get(
    '/equipes/:id',
    controllers.equipe.getById.bind(controllers.equipe)
  );
  router.put(
    '/equipes/:id',
    controllers.equipe.update.bind(controllers.equipe)
  );
  router.delete(
    '/equipes/:id',
    controllers.equipe.delete.bind(controllers.equipe)
  );

  return router;
}
