import { Projeto } from '../models/Projeto.model.js';
import { isNonEmptyString } from '../utils/typeValidations.js';

export class ProjetoService {
  constructor(client) {
    this.client = client;
  }

  async create(projeto) {
    if (!(projeto instanceof Projeto)) {
      throw new TypeError(`O objeto deve ser uma instância de Projeto`);
    }

    try {
      return await this.client.create(projeto);
    } catch (error) {
      throw new Error(`Erro ao criar projeto:${error.message}`, error);
    }
  }

  async getById(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError(`ID deve ser uma string não vazia`);
    }

    try {
      return await this.client.getById(id);
    } catch (error) {
      throw new Error(`Erro ao obter projeto por ID:${error.message}`, error);
    }
  }

  async getAll() {
    try {
      return await this.client.getAll();
    } catch (error) {
      throw new Error(
        `Erro ao obter todos os projetos:${error.message}`,
        error
      );
    }
  }

  async update(id, updatedData) {
    if (!isNonEmptyString(id)) {
      throw new TypeError(`ID deve ser uma string não vazia`);
    }

    if (!(updatedData instanceof Projeto)) {
      throw new TypeError(`O objeto deve ser uma instância de Projeto`);
    }

    try {
      return await this.client.update(id, updatedData);
    } catch (error) {
      throw new Error(`Erro ao atualizar projeto:${error.message}`, error);
    }
  }

  async delete(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError(`ID deve ser uma string não vazia`);
    }

    try {
      return await this.client.delete(id);
    } catch (error) {
      throw new Error(`Erro ao deletar projeto:${error.message}`, error);
    }
  }
}
