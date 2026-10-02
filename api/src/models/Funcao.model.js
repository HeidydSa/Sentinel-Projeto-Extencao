import { isDate, isNonEmptyString } from '../utils/typeValidations.js';

export class Funcao {
  constructor({ id, tipo, createdAt, updatedAt }) {
    this.id = id ?? null;
    this.tipo = tipo;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();

    this.validate();
  }

  toJSON() {
    return {
      id: this.id,
      tipo: this.tipo,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  validate() {
    if (!isNonEmptyString(this.tipo)) {
      throw new TypeError('Tipo não pode ser uma string vazia');
    }

    if (!isDate(this.createdAt)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }

    if (!isDate(this.updatedAt)) {
      throw new TypeError('Data de atualização deve ser um objeto Date');
    }
  }
}
