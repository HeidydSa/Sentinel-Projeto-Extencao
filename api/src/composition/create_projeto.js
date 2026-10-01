import { ProjetoRepository } from '../repositories/ProjetoRepository.js';
import { ProjetoService } from '../services/ProjetoService.js';
import { ProjetoController } from '../controllers/ProjetoController.js';

export function createProjeto(db) {
  const repository = new ProjetoRepository(db);
  const service = new ProjetoService(repository);
  const controller = new ProjetoController(service);

  return controller;
}
