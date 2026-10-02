import { Equipe } from '../models/Equipe.model.js';
import { isNonEmptyString } from '../utils/typeValidations.js';

export class EquipeService {
  constructor(client) {
    this.client = client;
  }

  async create(equipe) {
    if (!(equipe instanceof Equipe)) {
      throw new TypeError(`O objeto deve ser uma instância de Equipe`);
    }

    try {
      return await this.client.create(equipe);
    } catch (error) {
      throw new Error(`Erro ao criar equipe: ${error.message}`, error);
    }
  }

  async getById(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError(`ID deve ser uma string não vazia`);
    }

    try {
      return await this.client.getById(id);
    } catch (error) {
      throw new Error(`Erro ao obter equipe por ID:${error.message}`, error);
    }
  }

  async getAll() {
    try {
      return await this.client.getAll();
    } catch (error) {
      throw new Error(`Erro ao obter todas as equipes:${error.message}`, error);
    }
  }

  async update(id, updatedData) {
    if (!isNonEmptyString(id)) {
      throw new TypeError(`ID deve ser uma string não vazia`);
    }

    if (!(updatedData instanceof Equipe)) {
      throw new TypeError(`O objeto deve ser uma instância de Equipe`);
    }

    try {
      return await this.client.update(id, updatedData);
    } catch (error) {
      throw new Error(`Erro ao atualizar equipe:${error.message}`, error);
    }
  }

  async delete(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError(`ID deve ser uma string não vazia`);
    }

    try {
      return await this.client.delete(id);
    } catch (error) {
      throw new Error(`Erro ao deletar equipe:${error.message}`, error);
    }
  }
}
