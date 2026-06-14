import {
  isDate,
  isNonEmptyString,
  isString,
} from '../utils/typeValidations.js';

export class Projeto {
  constructor({ id, titulo, descricao, id_equipe, data_criacao, status }) {
    this.id = id ?? '';
    this.titulo = titulo;
    this.descricao = descricao;
    this.idEquipe = id_equipe ?? '';
    this.dataCriacao = data_criacao ? new Date(data_criacao) : new Date();
    this.status = status;

    this.validate();
  }

  validate() {
    if (!isString(this.id)) {
      throw new TypeError('Id deve ser uma string');
    }

    if (!isNonEmptyString(this.titulo)) {
      throw new TypeError('Título não pode ser uma string vazia');
    }

    if (!isNonEmptyString(this.descricao)) {
      throw new TypeError('Descrição não pode ser uma string vazia');
    }

    if (!isNonEmptyString(this.status)) {
      throw new TypeError('Status não pode ser uma string vazia');
    }

    if (!isString(this.idEquipe)) {
      throw new TypeError('ID da equipe deve ser uma string');
    }

    if (!isDate(this.dataCriacao)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }
  }

  toPersisted() {
    return {
      id: this.id,
      titulo: this.titulo,
      descricao: this.descricao,
      id_equipe: this.idEquipe,
      data_criacao: this.dataCriacao.toISOString(),
      status: this.status,
    };
  }
}
