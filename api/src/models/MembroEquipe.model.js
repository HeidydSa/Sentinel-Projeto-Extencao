import { isDate, isPositiveNumber } from '../utils/typeValidations.js';

export class MembroEquipe {
  constructor({ equipeId, usuarioId, createdAt, updatedAt }) {
    this.equipeId = equipeId;
    this.usuarioId = usuarioId;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();

    this.validate();
  }

  validate() {
    if (!isPositiveNumber(this.equipeId)) {
      throw new TypeError('EquipeId deve ser um número positivo');
    }

    if (!isPositiveNumber(this.usuarioId)) {
      throw new TypeError('UsuarioId deve ser um número positivo');
    }

    if (!isDate(this.createdAt)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }

    if (!isDate(this.updatedAt)) {
      throw new TypeError('Data de atualização deve ser um objeto Date');
    }
  }
}
