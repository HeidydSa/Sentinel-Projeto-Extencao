import { EquipeRepository } from '../repositories/equipes.repository.js';
import { EquipeService } from '../services/equipes.service.js';
import { EquipeController } from '../controllers/equipe.controller.js';

export function createEquipe(db) {
  const repository = new EquipeRepository(db);
  const service = new EquipeService(repository);
  const controller = new EquipeController(service);

  return controller;
}
