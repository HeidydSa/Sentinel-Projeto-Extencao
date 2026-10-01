import { ComentarioRepository } from '../repositories/ComentarioRepository.js';
import { ComentarioService } from '../services/ComentarioService.js';
import { ComentarioController } from '../controllers/ComentarioController.js';

export function createComentario(db) {
  const repository = new ComentarioRepository({ db });
  const service = new ComentarioService(repository);
  const controller = new ComentarioController(service);

  return controller;
}
