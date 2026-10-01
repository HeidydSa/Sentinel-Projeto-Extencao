import { Funcao } from '../models/Funcao.model.js';
import { ValidationError } from '../errors/ValidationError.js';

export class FuncaoService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(payload) {
    let funcao;
    try {
      funcao = new Funcao(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.create(funcao);
  }

  async getById(id) {
    return await this.repository.getById(id);
  }

  async getAll() {
    return await this.repository.getAll();
  }

  async update(id, payload) {
    let funcao;
    try {
      funcao = new Funcao(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.update(id, funcao);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }
}
