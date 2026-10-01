import { Comentario } from '../models/Comentario.model.js';
import { ValidationError } from '../errors/ValidationError.js';

export class ComentarioService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(tarefaId, payload) {
    let comentario;
    try {
      comentario = new Comentario(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.create(tarefaId, comentario);
  }

  async getById(tarefaId, comentarioId) {
    return await this.repository.getById(tarefaId, comentarioId);
  }

  async getAll(tarefaId) {
    return await this.repository.getAll(tarefaId);
  }

  async delete(tarefaId, comentarioId) {
    return await this.repository.delete(tarefaId, comentarioId);
  }
}
