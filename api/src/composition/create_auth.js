import { UsuarioRepository } from '../repositories/usuarios.repository.js';
import { AuthService } from '../services/auth.service.js';
import { UsuarioService } from '../services/usuarios.service.js';
import { AuthController } from '../controllers/auth_controller.js';

export function createAuth(db) {
  const repository = new UsuarioRepository(db);
  const usuarioService = new UsuarioService(repository);
  const service = new AuthService(repository, usuarioService);
  const controller = new AuthController(service);

  return controller;
}
