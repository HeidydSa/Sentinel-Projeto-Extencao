import { EquipeRepository } from '../repositories/EquipeRepository.js';
import { EquipeService } from '../services/EquipeService.js';
import { EquipeController } from '../controllers/EquipeController.js';

export function createEquipe(db) {
  const repository = new EquipeRepository(db);
  const service = new EquipeService(repository);
  const controller = new EquipeController(service);

  return controller;
}
