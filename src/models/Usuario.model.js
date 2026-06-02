import {
  isEmail,
  isNonEmptyString,
  isString,
} from '../utils/typeValidations.js';

export class Usuario {
  constructor(id, nome, sobrenome, email, senha, funcaoId, dataCriacao) {
    this.id = id ?? '';
    this.nome = nome;
    this.sobrenome = sobrenome;
    this.email = email;
    this.senha = senha;
    this.funcaoId = funcaoId;
    this.dataCriacao = new Date(dataCriacao);

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
      throw new TypeError('Email não pode ser uma string vazia');
    }

    if (!isNonEmptyString(this.senha)) {
      throw new TypeError('Senha não pode ser uma string vazia');
    }

    if (!isString(this.funcaoId)) {
      throw new TypeError('Função ID não pode ser uma string vazia');
    }

    if (!(this.dataCriacao instanceof Date)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }
  }

  toPersisted() {
    return {
      id: this.id,
      nome: this.nome,
      sobrenome: this.sobrenome,
      email: this.email,
      senha: this.senha,
      funcaoId: this.funcaoId,
      dataCriacao: this.dataCriacao.toISOString(),
    };
  }
}
