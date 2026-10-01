import { FuncaoRepository } from '../repositories/FuncaoRepository.js';
import { FuncaoService } from '../services/FuncaoService.js';
import { FuncaoController } from '../controllers/FuncaoController.js';

export function createFuncao(db) {
  const repository = new FuncaoRepository(db);
  const service = new FuncaoService(repository);
  const controller = new FuncaoController(service);

  return controller;
}
