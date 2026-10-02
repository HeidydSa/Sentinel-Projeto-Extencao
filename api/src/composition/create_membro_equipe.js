import { MembroEquipeRepository } from '../repositories/membro_equipe.repository.js';
import { MembroEquipeService } from '../services/membro_equipe.service.js';
import { MembroEquipeController } from '../controllers/membro_equipe.controller.js';

export function createMembroEquipe(db) {
  const repository = new MembroEquipeRepository(db);
  const service = new MembroEquipeService(repository);
  const controller = new MembroEquipeController(service);

  return controller;
}
