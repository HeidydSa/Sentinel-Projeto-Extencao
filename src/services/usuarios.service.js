import { Usuario } from '../models/Usuario.model';
import { isNonEmptyString } from '../utils/typeValidations';

export class UsuarioService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(usuario) {
    if (!(usuario instanceof Usuario)) {
      throw new TypeError('O objeto deve ser uma instância de Usuario');
    }

    try {
      return await this.repository.create(usuario);
    } catch (error) {
      throw new Error('Erro ao criar usuário:', error);
    }
  }

  async getById(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.getById(id);
    } catch (error) {
      throw new Error('Erro ao obter usuário por ID:', error);
    }
  }

  async getAll() {
    try {
      return await this.repository.getAll();
    } catch (error) {
      throw new Error('Erro ao obter todos os usuários:', error);
    }
  }

  async update(id, updatedData) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    if (!(updatedData instanceof Usuario)) {
      throw new TypeError('O objeto deve ser uma instância de Usuario');
    }

    try {
      return await this.repository.update(id, updatedData);
    } catch (error) {
      throw new Error('Erro ao atualizar usuário:', error);
    }
  }

  async delete(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw new Error('Erro ao deletar usuário:', error);
    }
  }
}
