import { isDate, isNonEmptyString } from '../utils/typeValidations.js';

export class Projeto {
  constructor({
    id,
    titulo,
    descricao,
    idEquipe,
    status,
    createdAt,
    updatedAt,
  }) {
    this.id = id ?? null;
    this.titulo = titulo;
    this.descricao = descricao ?? '';
    this.idEquipe = idEquipe ?? null;
    this.status = status ?? 'ativo';
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();

    this.validate();
  }

  toJSON() {
    return {
      id: this.id,
      titulo: this.titulo,
      descricao: this.descricao,
      idEquipe: this.idEquipe,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  validate() {
    if (!isNonEmptyString(this.titulo)) {
      throw new TypeError('Título não pode ser uma string vazia');
    }

    if (typeof this.descricao !== 'string') {
      throw new TypeError('Descrição deve ser uma string');
    }

    if (!isNonEmptyString(this.status)) {
      throw new TypeError('Status não pode ser uma string vazia');
    }

    if (!isDate(this.createdAt)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }

    if (!isDate(this.updatedAt)) {
      throw new TypeError('Data de atualização deve ser um objeto Date');
    }
  }
}
