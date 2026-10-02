import { ProjetoRepository } from '../repositories/projetos.repository.js';
import { ProjetoService } from '../services/projetos.service.js';
import { ProjetoController } from '../controllers/projeto.controller.js';

export function createProjeto(db) {
  const repository = new ProjetoRepository(db);
  const service = new ProjetoService(repository);
  const controller = new ProjetoController(service);

  return controller;
}
