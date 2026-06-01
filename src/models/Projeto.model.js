import { isDate, isNonEmptyString, isString } from '../utils/typeValidations';

export class Projeto {
  constructor(id, titulo, descricao, id_equipe, data_criacao) {
    this.id = id ?? '';
    this.titulo = titulo;
    this.descricao = descricao;
    this.id_equipe = id_equipe;
    this.data_criacao = new Date(data_criacao);

    this.validate();
  }

  validate() {
    if (!isNonEmptyString(this.titulo)) {
      throw new TypeError('Título não pode ser uma string vazia');
    }

    if (!isNonEmptyString(this.descricao)) {
      throw new TypeError('Descrição não pode ser uma string vazia');
    }

    if (!isString(this.id_equipe)) {
      throw new TypeError('ID da equipe deve ser uma string');
    }

    if (!isDate(this.data_criacao)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }
  }

  toPersisted() {
    return {
      id: this.id,
      titulo: this.titulo,
      descricao: this.descricao,
      id_equipe: this.id_equipe,
      data_criacao: this.data_criacao.toISOString(),
    };
  }
}
