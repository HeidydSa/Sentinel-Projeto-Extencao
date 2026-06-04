import { isDate, isNonEmptyString } from '../utils/typeValidations.js';

export class Funcao {
  constructor(id, tipo, dataCriacao) {
    this.id = id ?? '';
    this.tipo = tipo;
    this.dataCriacao = new Date(dataCriacao);

    this.validate();
  }

  validate() {
    if (!isNonEmptyString(this.tipo)) {
      throw new TypeError('Tipo da função não pode ser uma string vazia');
    }

    if (!isDate(this.dataCriacao)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }
  }

  toPersisted() {
    return {
      id: this.id,
      tipo: this.tipo,
      dataCriacao: this.dataCriacao.toISOString(),
    };
  }
}
