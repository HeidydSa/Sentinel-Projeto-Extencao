import { isDate, isNonEmptyString } from '../utils/typeValidations.js';

export class Equipe {
  constructor({ id, nome, idLider, createdAt, updatedAt }) {
    this.id = id ?? null;
    this.nome = nome;
    this.idLider = idLider ?? null;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();

    this.validate();
  }

  validate() {
    if (!isNonEmptyString(this.nome)) {
      throw new TypeError('Nome não pode ser uma string vazia');
    }

    if (!isDate(this.createdAt)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }

    if (!isDate(this.updatedAt)) {
      throw new TypeError('Data de atualização deve ser um objeto Date');
    }
  }
}
