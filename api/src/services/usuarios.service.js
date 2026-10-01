import { Usuario } from '../models/Usuario.model.js';
import { ValidationError } from '../errors/ValidationError.js';

export class UsuarioService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(payload) {
    let usuario;
    try {
      usuario = new Usuario(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.create(usuario);
  }

  async getById(id) {
    return await this.repository.getById(id);
  }

  async getAll() {
    return await this.repository.getAll();
  }

  async update(id, payload) {
    let usuario;
    try {
      usuario = new Usuario(payload);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ValidationError(error.message);
      }
      throw error;
    }

    return await this.repository.update(id, usuario);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }
}
