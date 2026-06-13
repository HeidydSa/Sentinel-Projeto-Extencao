import { isEmail, isNonEmptyString } from '../utils/typeValidations.js';

export class Usuario {
  constructor(id, nome, sobrenome, email, dataCriacao) {
    this.id = id ?? '';
    this.nome = nome;
    this.sobrenome = sobrenome;
    this.email = email;
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

    if (!(this.dataCriacao instanceof Date)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }
  }

  getInitials() {
    return `${this.nome.charAt(0)}${this.sobrenome.charAt(0)}`.toUpperCase();
  }

  toPersisted() {
    return {
      id: this.id,
      nome: this.nome,
      sobrenome: this.sobrenome,
      email: this.email,
      senha: this.senha,
      funcao_id: this.funcaoId,
      data_criacao: this.dataCriacao.toISOString(),
    };
  }
}
