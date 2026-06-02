import { Tarefa } from '../models/Tarefa.model.js';
import { isNonEmptyString } from '../utils/typeValidations.js';

export class TarefaService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(tarefa) {
    if (!(tarefa instanceof Tarefa)) {
      throw new TypeError('O objeto deve ser uma instância de Tarefa');
    }

    try {
      return await this.repository.create(tarefa);
    } catch (error) {
      throw new Error('Erro ao criar tarefa:', error);
    }
  }

  async getById(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.getById(id);
    } catch (error) {
      throw new Error('Erro ao obter tarefa por ID:', error);
    }
  }

  async getAll() {
    try {
      return await this.repository.getAll();
    } catch (error) {
      throw new Error('Erro ao obter todas as tarefas:', error);
    }
  }

  async update(id, updatedData) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    if (!(updatedData instanceof Tarefa)) {
      throw new TypeError('O objeto deve ser uma instância de Tarefa');
    }

    try {
      return await this.repository.update(id, updatedData);
    } catch (error) {
      throw new Error('Erro ao atualizar tarefa:', error);
    }
  }

  async delete(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw new Error('Erro ao deletar tarefa:', error);
    }
  }
}
