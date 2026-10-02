import { Router } from 'express';

export function buildTarefaRoutes({ controllers }) {
  const router = Router();

  router.post('/tarefas', controllers.tarefa.create.bind(controllers.tarefa));
  router.get('/tarefas', controllers.tarefa.getAll.bind(controllers.tarefa));
  router.get(
    '/tarefas/:id',
    controllers.tarefa.getById.bind(controllers.tarefa)
  );
  router.put(
    '/tarefas/:id',
    controllers.tarefa.update.bind(controllers.tarefa)
  );
  router.delete(
    '/tarefas/:id',
    controllers.tarefa.delete.bind(controllers.tarefa)
  );

  return router;
}
