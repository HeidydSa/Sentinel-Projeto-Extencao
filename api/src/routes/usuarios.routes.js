import { Router } from 'express';

export function buildUsuarioRoutes({ controllers }) {
  const router = Router();

  router.post(
    '/usuarios',
    controllers.usuario.create.bind(controllers.usuario)
  );
  router.get('/usuarios', controllers.usuario.getAll.bind(controllers.usuario));
  router.get(
    '/usuarios/:id',
    controllers.usuario.getById.bind(controllers.usuario)
  );
  router.put(
    '/usuarios/:id',
    controllers.usuario.update.bind(controllers.usuario)
  );
  router.delete(
    '/usuarios/:id',
    controllers.usuario.delete.bind(controllers.usuario)
  );

  return router;
}
