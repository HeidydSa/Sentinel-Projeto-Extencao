import {
  isDate,
  isNonEmptyString,
  isPositiveNumber,
} from '../utils/typeValidations.js';

export class Comentario {
  constructor({ id, idUsuario, detalhe, createdAt, updatedAt }) {
    this.id = id ?? null;
    this.idUsuario = idUsuario;
    this.detalhe = detalhe ?? '';
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();

    this.validate();
  }

  validate() {
    if (!isPositiveNumber(this.idUsuario)) {
      throw new TypeError('IdUsuario deve ser um número positivo');
    }

    if (!isNonEmptyString(this.detalhe)) {
      throw new TypeError('Detalhe não pode ser uma string vazia');
    }

    if (!isDate(this.createdAt)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }

    if (!isDate(this.updatedAt)) {
      throw new TypeError('Data de atualização deve ser um objeto Date');
    }
  }
}
