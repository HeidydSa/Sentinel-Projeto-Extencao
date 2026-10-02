import { Tarefa } from '../models/Tarefa.model.js';
import { ValidationError } from '../errors/validation.error.js';

export class TarefaService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(payload) {
    let tarefa;
    try {
      tarefa = new Tarefa(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.create(tarefa);
  }

  async getById(id) {
    return await this.repository.getById(id);
  }

  async getAll() {
    return await this.repository.getAll();
  }

  async update(id, payload) {
    let tarefa;
    try {
      tarefa = new Tarefa(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.update(id, tarefa);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }
}
