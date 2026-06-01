import { isDate, isNonEmptyString } from '../utils/typeValidations';

export class Funcao {
  constructor(id, nome, dataCriacao) {
    this.id = id ?? '';
    this.nome = nome;
    this.dataCriacao = new Date(dataCriacao);

    this.validate();
  }

  validate() {
    if (!isNonEmptyString(this.nome)) {
      throw new TypeError('Nome da função não pode ser uma string vazia');
    }

    if (!isDate(this.dataCriacao)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }
  }

  toPersisted() {
    return {
      id: this.id,
      nome: this.nome,
      dataCriacao: this.dataCriacao.toISOString(),
    };
  }
}
