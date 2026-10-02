import { Router } from 'express';

export function buildAndamentoTarefaRoutes({ controllers }) {
  const router = Router();

  router.post(
    '/andamentos',
    controllers.andamentoTarefa.create.bind(controllers.andamentoTarefa)
  );
  router.get(
    '/andamentos',
    controllers.andamentoTarefa.getAll.bind(controllers.andamentoTarefa)
  );
  router.get(
    '/andamentos/:id',
    controllers.andamentoTarefa.getById.bind(controllers.andamentoTarefa)
  );
  router.put(
    '/andamentos/:id',
    controllers.andamentoTarefa.update.bind(controllers.andamentoTarefa)
  );
  router.delete(
    '/andamentos/:id',
    controllers.andamentoTarefa.delete.bind(controllers.andamentoTarefa)
  );

  return router;
}
