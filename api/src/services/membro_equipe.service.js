import { MembroEquipe } from '../models/MembroEquipe.model.js';
import { ValidationError } from '../errors/validation.error.js';

export class MembroEquipeService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(payload) {
    let membroEquipe;
    try {
      membroEquipe = new MembroEquipe(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.create(membroEquipe);
  }

  async getById(equipeId, usuarioId) {
    return await this.repository.getById(equipeId, usuarioId);
  }

  async getAllByEquipe(equipeId) {
    return await this.repository.getAllByEquipe(equipeId);
  }

  async delete(equipeId, usuarioId) {
    return await this.repository.delete(equipeId, usuarioId);
  }
}
