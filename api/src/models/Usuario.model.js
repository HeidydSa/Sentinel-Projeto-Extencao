import { isDate, isEmail, isNonEmptyString } from '../utils/typeValidations.js';

export class Usuario {
  constructor({
    id,
    nome,
    sobrenome,
    email,
    senha,
    funcaoId,
    createdAt,
    updatedAt,
  }) {
    this.id = id ?? null;
    this.nome = nome;
    this.sobrenome = sobrenome;
    this.email = email;
    this.senha = senha;
    this.funcaoId = funcaoId;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();

    this.validate();
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

    if (!isNonEmptyString(this.senha)) {
      throw new TypeError('Senha não pode ser uma string vazia');
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
