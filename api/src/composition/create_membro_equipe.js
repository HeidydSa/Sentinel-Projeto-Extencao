import { MembroEquipeRepository } from '../repositories/MembroEquipeRepository.js';
import { MembroEquipeService } from '../services/MembroEquipeService.js';
import { MembroEquipeController } from '../controllers/MembroEquipeController.js';

export function createMembroEquipe(db) {
  const repository = new MembroEquipeRepository(db);
  const service = new MembroEquipeService(repository);
  const controller = new MembroEquipeController(service);

  return controller;
}
