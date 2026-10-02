import {
  isDate,
  isNonEmptyString,
  isNonNegativeNumber,
} from '../utils/typeValidations.js';

export class AndamentoTarefa {
  constructor({ id, titulo, ordem, createdAt, updatedAt }) {
    this.id = id ?? null;
    this.titulo = titulo;
    this.ordem = ordem;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();

    this.validate();
  }

  toJSON() {
    return {
      id: this.id,
      titulo: this.titulo,
      ordem: this.ordem,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  validate() {
    if (!isNonEmptyString(this.titulo)) {
      throw new TypeError('Título não pode ser uma string vazia');
    }

    if (!isNonNegativeNumber(this.ordem)) {
      throw new TypeError('Ordem deve ser um número não negativo');
    }

    if (!isDate(this.createdAt)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }

    if (!isDate(this.updatedAt)) {
      throw new TypeError('Data de atualização deve ser um objeto Date');
    }
  }
}
