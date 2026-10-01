import { AndamentoTarefa } from '../models/AndamentoTarefa.model.js';
import { ValidationError } from '../errors/validation.error.js';

export class AndamentoTarefaService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(payload) {
    let andamentoTarefa;
    try {
      andamentoTarefa = new AndamentoTarefa(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.create(andamentoTarefa);
  }

  async getById(id) {
    return await this.repository.getById(id);
  }

  async getAll() {
    return await this.repository.getAll();
  }

  async update(id, payload) {
    let andamentoTarefa;
    try {
      andamentoTarefa = new AndamentoTarefa(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.update(id, andamentoTarefa);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }
}
