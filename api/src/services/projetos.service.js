import { Projeto } from '../models/Projeto.model.js';
import { ValidationError } from '../errors/validation.error.js';

export class ProjetoService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(payload) {
    let projeto;
    try {
      projeto = new Projeto(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.create(projeto);
  }

  async getById(id) {
    return await this.repository.getById(id);
  }

  async getAll() {
    return await this.repository.getAll();
  }

  async update(id, payload) {
    let projeto;
    try {
      projeto = new Projeto(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.update(id, projeto);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }
}
