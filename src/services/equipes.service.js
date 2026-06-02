import { Equipe } from '../models/Equipe.model.js';
import { isNonEmptyString } from '../utils/typeValidations.js';

export class EquipeService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(equipe) {
    if (!(equipe instanceof Equipe)) {
      throw new TypeError('O objeto deve ser uma instância de Equipe');
    }

    try {
      return await this.repository.create(equipe);
    } catch (error) {
      throw new Error('Erro ao criar equipe:', error);
    }
  }

  async getById(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.getById(id);
    } catch (error) {
      throw new Error('Erro ao obter equipe por ID:', error);
    }
  }

  async getAll() {
    try {
      return await this.repository.getAll();
    } catch (error) {
      throw new Error('Erro ao obter todas as equipes:', error);
    }
  }

  async update(id, updatedData) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    if (!(updatedData instanceof Equipe)) {
      throw new TypeError('O objeto deve ser uma instância de Equipe');
    }

    try {
      return await this.repository.update(id, updatedData);
    } catch (error) {
      throw new Error('Erro ao atualizar equipe:', error);
    }
  }

  async delete(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw new Error('Erro ao deletar equipe:', error);
    }
  }
}
