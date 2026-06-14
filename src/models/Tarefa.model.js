import { isNonEmptyString, isString } from '../utils/typeValidations.js';
import { Usuario } from './Usuario.model.js';

export class Tarefa {
  constructor({
    id,
    titulo,
    data,
    economia,
    idProjeto,
    idCriador,
    idResponsavel,
    status,
    responsavel,
    descricao,
    comentarios,
  }) {
    this.id = id ?? '-1';
    this.titulo = titulo;
    this.data = new Date(data);
    this.economia = economia;
    this.idProjeto = idProjeto;
    this.idCriador = idCriador;
    this.idResponsavel = idResponsavel ?? '';
    this.status = status ?? 'afazer';
    this.responsavel = responsavel;
    this.descricao = descricao ?? '';
    this.comentarios = comentarios ?? [];

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

    if (!isNonEmptyString(this.idProjeto)) {
      throw new TypeError('ID do projeto não pode ser uma string vazia');
    }

    if (!isNonEmptyString(this.idCriador)) {
      throw new TypeError('ID do criador não pode ser uma string vazia');
    }

    if (!isString(this.idResponsavel)) {
      throw new TypeError('ID do responsável não pode ser uma string vazia');
    }

    if (!isString(this.descricao)) {
      throw new TypeError('Descrição não pode ser uma string vazia');
    }

    if (!isNonEmptyString(this.status)) {
      throw new TypeError('Status não pode ser uma string vazia');
    }

    if (
      this.responsavel !== null &&
      this.responsavel !== undefined &&
      !(this.responsavel instanceof Usuario)
    ) {
      throw new TypeError('Responsável deve ser uma string ou null');
    }

    if (!Array.isArray(this.comentarios)) {
      throw new TypeError('Comentários deve ser um array');
    }
  }

  toPersisted() {
    return {
      id: this.id,
      titulo: this.titulo,
      data: this.data.toISOString(),
      economia: this.economia,
      id_projeto: this.idProjeto,
      id_criador: this.idCriador,
      id_responsavel: this.idResponsavel,
      descricao: this.descricao,
      status: this.status,
    };
  }
}
