import { ComentarioRepository } from '../repositories/comentario.repository.js';
import { ComentarioService } from '../services/comentario.service.js';
import { ComentarioController } from '../controllers/comentario.controller.js';

export function createComentario(db) {
  const repository = new ComentarioRepository({ db });
  const service = new ComentarioService(repository);
  const controller = new ComentarioController(service);

  return controller;
}
