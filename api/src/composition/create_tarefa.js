import { TarefaRepository } from '../repositories/tarefas.repository.js';
import { TarefaService } from '../services/tarefas.service.js';
import { TarefaController } from '../controllers/tarefa.controller.js';

import { UsuarioRepository } from '../repositories/usuarios.repository.js';
import { ComentarioRepository } from '../repositories/comentario.repository.js';

export function createTarefa(db) {
  const usuarioRepository = new UsuarioRepository(db);
  const comentarioRepository = new ComentarioRepository({ db });

  const repository = new TarefaRepository({
    db,
    usuarioRepository,
    comentarioRepository,
  });

  const service = new TarefaService(repository);
  const controller = new TarefaController(service);

  return controller;
}
