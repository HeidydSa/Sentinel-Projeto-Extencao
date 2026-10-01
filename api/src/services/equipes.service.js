import { Equipe } from '../models/Equipe.model.js';
import { ValidationError } from '../errors/ValidationError.js';

export class EquipeService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(payload) {
    let equipe;
    try {
      equipe = new Equipe(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.create(equipe);
  }

  async getById(id) {
    return await this.repository.getById(id);
  }

  async getAll() {
    return await this.repository.getAll();
  }

  async update(id, payload) {
    let equipe;
    try {
      equipe = new Equipe(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.update(id, equipe);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }
}
