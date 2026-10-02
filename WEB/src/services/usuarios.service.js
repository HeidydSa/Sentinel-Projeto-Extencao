import { Usuario } from '../models/Usuario.model.js';
import { isNonEmptyString } from '../utils/typeValidations.js';

export class UsuarioService {
  constructor(client) {
    this.client = client;
  }

  async create(usuario) {
    if (!(usuario instanceof Usuario)) {
      throw new TypeError(`O objeto deve ser uma instância de Usuario`);
    }

    try {
      return await this.client.create(usuario);
    } catch (error) {
      throw new Error(`Erro ao criar usuário:${error.message}`, error);
    }
  }

  async getById(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError(`ID deve ser uma string não vazia`);
    }

    try {
      return await this.client.getById(id);
    } catch (error) {
      throw new Error(`Erro ao obter usuário por ID:${error.message}`, error);
    }
  }

  async getAll() {
    try {
      return await this.client.getAll();
    } catch (error) {
      throw new Error(
        `Erro ao obter todos os usuários:${error.message}`,
        error
      );
    }
  }

  async update(id, updatedData) {
    if (!isNonEmptyString(id)) {
      throw new TypeError(`ID deve ser uma string não vazia`);
    }

    if (!(updatedData instanceof Usuario)) {
      throw new TypeError(`O objeto deve ser uma instância de Usuario`);
    }

    try {
      return await this.client.update(id, updatedData);
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário:${error.message}`, error);
    }
  }

  async delete(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError(`ID deve ser uma string não vazia`);
    }

    try {
      return await this.client.delete(id);
    } catch (error) {
      throw new Error(`Erro ao deletar usuário:${error.message}`, error);
    }
  }
}
