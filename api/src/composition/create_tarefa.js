import { TarefaRepository } from '../repositories/TarefaRepository.js';
import { TarefaService } from '../services/TarefaService.js';
import { TarefaController } from '../controllers/TarefaController.js';

import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { ComentarioRepository } from '../repositories/ComentarioRepository.js';

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
