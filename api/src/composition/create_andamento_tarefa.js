import { AndamentoTarefaRepository } from '../repositories/andamento_tarefa.repository.js';
import { AndamentoTarefaService } from '../services/andamento_tarefas.service.js';
import { AndamentoTarefaController } from '../controllers/andamento_tarefa.controller.js';

export function createAndamentoTarefa(db) {
  const repository = new AndamentoTarefaRepository(db);
  const service = new AndamentoTarefaService(repository);
  const controller = new AndamentoTarefaController(service);

  return controller;
}
