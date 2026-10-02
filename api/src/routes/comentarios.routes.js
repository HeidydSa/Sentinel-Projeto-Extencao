import { Router } from 'express';

export function buildComentarioRoutes({ controllers }) {
  const router = Router();

  router.post(
    '/tarefas/:tarefaId/comentarios',
    controllers.comentario.create.bind(controllers.comentario)
  );
  router.get(
    '/tarefas/:tarefaId/comentarios',
    controllers.comentario.getAll.bind(controllers.comentario)
  );
  router.get(
    '/tarefas/:tarefaId/comentarios/:comentarioId',
    controllers.comentario.getById.bind(controllers.comentario)
  );
  router.delete(
    '/tarefas/:tarefaId/comentarios/:comentarioId',
    controllers.comentario.delete.bind(controllers.comentario)
  );

  return router;
}
