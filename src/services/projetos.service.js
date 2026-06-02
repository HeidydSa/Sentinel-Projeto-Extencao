import { Projeto } from '../models/Projeto.model.js';
import { isNonEmptyString } from '../utils/typeValidations.js';

export class ProjetoService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(projeto) {
    if (!(projeto instanceof Projeto)) {
      throw new TypeError('O objeto deve ser uma instância de Projeto');
    }

    try {
      return await this.repository.create(projeto);
    } catch (error) {
      throw new Error('Erro ao criar projeto:', error);
    }
  }

  async getById(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.getById(id);
    } catch (error) {
      throw new Error('Erro ao obter projeto por ID:', error);
    }
  }

  async getAll() {
    try {
      return await this.repository.getAll();
    } catch (error) {
      throw new Error('Erro ao obter todos os projetos:', error);
    }
  }

  async update(id, updatedData) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    if (!(updatedData instanceof Projeto)) {
      throw new TypeError('O objeto deve ser uma instância de Projeto');
    }

    try {
      return await this.repository.update(id, updatedData);
    } catch (error) {
      throw new Error('Erro ao atualizar projeto:', error);
    }
  }

  async delete(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw new Error('Erro ao deletar projeto:', error);
    }
  }
}
