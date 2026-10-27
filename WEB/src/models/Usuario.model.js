import { isDate, isEmail, isNonEmptyString } from '../utils/typeValidations.js';

export class Usuario {
  constructor({ id, nome, sobrenome, email, funcaoId, createdAt, updatedAt }) {
    this.id = id ?? null;
    this.nome = nome;
    this.sobrenome = sobrenome;
    this.email = email;
    this.funcaoId = funcaoId;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();

    this.validate();
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      sobrenome: this.sobrenome,
      email: this.email,
      funcaoId: this.funcaoId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  validate() {
    if (!isNonEmptyString(this.nome)) {
      throw new TypeError('Nome não pode ser uma string vazia');
    }

    if (!isNonEmptyString(this.sobrenome)) {
      throw new TypeError('Sobrenome não pode ser uma string vazia');
    }

    if (!isEmail(this.email)) {
      throw new TypeError('Email inválido');
    }

    if (!isNonEmptyString(String(this.funcaoId))) {
      throw new TypeError('FuncaoId é obrigatório');
    }

    if (!isDate(this.createdAt)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }

    if (!isDate(this.updatedAt)) {
      throw new TypeError('Data de atualização deve ser um objeto Date');
    }
  }
}
