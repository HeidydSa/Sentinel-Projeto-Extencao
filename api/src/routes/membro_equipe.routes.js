import { Router } from 'express';

export function buildMembroEquipeRoutes({ controllers }) {
  const router = Router();

  router.post(
    '/equipes/:equipeId/membros/:usuarioId',
    controllers.membroEquipe.create.bind(controllers.membroEquipe)
  );
  router.get(
    '/equipes/:equipeId/membros',
    controllers.membroEquipe.getAllByEquipe.bind(controllers.membroEquipe)
  );
  router.get(
    '/equipes/:equipeId/membros/:usuarioId',
    controllers.membroEquipe.getById.bind(controllers.membroEquipe)
  );
  router.delete(
    '/equipes/:equipeId/membros/:usuarioId',
    controllers.membroEquipe.delete.bind(controllers.membroEquipe)
  );

  return router;
}
