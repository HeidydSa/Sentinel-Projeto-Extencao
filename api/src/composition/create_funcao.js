import { FuncaoRepository } from '../repositories/funcoes.repository.js';
import { FuncaoService } from '../services/funcoes.service.js';
import { FuncaoController } from '../controllers/funcao.controller.js';

export function createFuncao(db) {
  const repository = new FuncaoRepository(db);
  const service = new FuncaoService(repository);
  const controller = new FuncaoController(service);

  return controller;
}
