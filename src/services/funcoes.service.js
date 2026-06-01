import { Funcao } from '../models/Funcao.model';
import { isNonEmptyString } from '../utils/typeValidations';

export class FuncaoService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(funcao) {
    if (!(funcao instanceof Funcao)) {
      throw new TypeError('O objeto deve ser uma instância de Funcao');
    }

    try {
      return await this.repository.create(funcao);
    } catch (error) {
      throw new Error('Erro ao criar função:', error);
    }
  }

  async getById(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.getById(id);
    } catch (error) {
      throw new Error('Erro ao obter função por ID:', error);
    }
  }

  async getAll() {
    try {
      return await this.repository.getAll();
    } catch (error) {
      throw new Error('Erro ao obter todas as funções:', error);
    }
  }

  async update(id, updatedData) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    if (!(updatedData instanceof Funcao)) {
      throw new TypeError('O objeto deve ser uma instância de Funcao');
    }

    try {
      return await this.repository.update(id, updatedData);
    } catch (error) {
      throw new Error('Erro ao atualizar função:', error);
    }
  }

  async delete(id) {
    if (!isNonEmptyString(id)) {
      throw new TypeError('ID deve ser uma string não vazia');
    }

    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw new Error('Erro ao deletar função:', error);
    }
  }
}
