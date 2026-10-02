import { UsuarioRepository } from '../repositories/usuarios.repository.js';
import { UsuarioService } from '../services/usuarios.service.js';
import { UsuarioController } from '../controllers/usuario_service.controller.js';

export function createUsuario(db) {
  const repository = new UsuarioRepository(db);
  const service = new UsuarioService(repository);
  const controller = new UsuarioController(service);

  return controller;
}
