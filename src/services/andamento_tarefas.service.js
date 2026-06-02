import { AndamentoTarefa } from '../models/AndamentoTarefa.model.js';
import { isNonEmptyString } from '../utils/typeValidations.js';

export class AndamentoTarefaService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(andamentoTarefa) {
    if (!(andamentoTarefa instanceof AndamentoTarefa)) {
      throw new TypeError('O objeto deve ser uma instância de AndamentoTarefa');
    }

    try {
      return await this.repository.create(andamentoTarefa);
    } catch (error) {
      throw new Error('Erro ao criar andamento de tarefa:', error);
    }
  }

  async getById(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.getById(id);
    } catch (error) {
      throw new Error('Erro ao obter andamento de tarefa por ID:', error);
    }
  }

  async getAll() {
    try {
      return await this.repository.getAll();
    } catch (error) {
      throw new Error('Erro ao obter todos os andamentos de tarefa:', error);
    }
  }

  async update(id, updatedData) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    if (!(updatedData instanceof AndamentoTarefa)) {
      throw new TypeError('O objeto deve ser uma instância de AndamentoTarefa');
    }

    try {
      return await this.repository.update(id, updatedData);
    } catch (error) {
      throw new Error('Erro ao atualizar andamento de tarefa:', error);
    }
  }

  async delete(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw new Error('Erro ao deletar andamento de tarefa:', error);
    }
  }
}
