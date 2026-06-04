import { isDate, isNonEmptyString } from '../utils/typeValidations.js';

export class Equipe {
  constructor(id, nome, idLider, dataCriacao) {
    this.id = id ?? '';
    this.nome = nome;
    this.idLider = idLider;
    this.dataCriacao = new Date(dataCriacao);

    this.validate();
  }

  validate() {
    if (!isNonEmptyString(this.nome)) {
      throw new TypeError('Nome da equipe não pode ser uma string vazia');
    }

    if (!isDate(this.dataCriacao)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }

    if (!isNonEmptyString(this.idLider)) {
      throw new TypeError('ID do líder não pode ser uma string vazia');
    }
  }

  toPersisted() {
    return {
      id: this.id,
      nome: this.nome,
      id_lider: this.idLider,
      data_criacao: this.dataCriacao.toISOString(),
    };
  }
}
