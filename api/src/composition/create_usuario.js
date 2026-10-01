import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { UsuarioService } from '../services/UsuarioService.js';
import { UsuarioController } from '../controllers/UsuarioController.js';

export function createUsuario(db) {
  const repository = new UsuarioRepository(db);
  const service = new UsuarioService(repository);
  const controller = new UsuarioController(service);

  return controller;
}
