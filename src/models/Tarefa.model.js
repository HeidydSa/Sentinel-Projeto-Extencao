import { isNonEmptyString, isString } from '../utils/typeValidations.js';

export class Tarefa {
  constructor(
    id,
    titulo,
    data,
    economia,
    id_projeto,
    id_criador,
    id_responsavel,
    id_andamento_tarefa,
    status
  ) {
    this.id = id ?? '';
    this.titulo = titulo;
    this.data = new Date(data);
    this.economia = economia;
    this.id_projeto = id_projeto;
    this.id_criador = id_criador;
    this.id_responsavel = id_responsavel;
    this.id_andamento_tarefa = id_andamento_tarefa;
    this.status = status;

    this.validate();
  }

  validate() {
    if (!isNonEmptyString(this.titulo)) {
      throw new TypeError('Título não pode ser uma string vazia');
    }

    if (!(this.data instanceof Date)) {
      throw new TypeError('Data deve ser um objeto Date');
    }

    if (typeof this.economia !== 'number' || this.economia < 0) {
      throw new TypeError('Economia deve ser um número não negativo');
    }

    if (!isNonEmptyString(this.id_projeto)) {
      throw new TypeError('ID do projeto não pode ser uma string vazia');
    }

    if (!isNonEmptyString(this.id_criador)) {
      throw new TypeError('ID do criador não pode ser uma string vazia');
    }

    if (!isString(this.id_responsavel)) {
      throw new TypeError('ID do responsável não pode ser uma string vazia');
    }

    if (!isNonEmptyString(this.id_andamento_tarefa)) {
      throw new TypeError(
        'ID do andamento da tarefa não pode ser uma string vazia'
      );
    }

    if (!isNonEmptyString(this.status)) {
      throw new TypeError('Status não pode ser uma string vazia');
    }
  }

  toPersisted() {
    return {
      id: this.id,
      titulo: this.titulo,
      data: this.data.toISOString(),
      economia: this.economia,
      id_projeto: this.id_projeto,
      id_criador: this.id_criador,
      id_responsavel: this.id_responsavel,
      id_andamento_tarefa: this.id_andamento_tarefa,
      status: this.status,
    };
  }
}
