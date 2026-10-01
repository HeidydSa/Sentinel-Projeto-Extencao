import { AndamentoTarefaRepository } from '../repositories/AndamentoTarefaRepository.js';
import { AndamentoTarefaService } from '../services/AndamentoTarefaService.js';
import { AndamentoTarefaController } from '../controllers/AndamentoTarefaController.js';

export function createAndamentoTarefa(db) {
  const repository = new AndamentoTarefaRepository(db);
  const service = new AndamentoTarefaService(repository);
  const controller = new AndamentoTarefaController(service);

  return controller;
}
