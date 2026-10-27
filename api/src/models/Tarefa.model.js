import {
  isDate,
  isNonEmptyString,
  isNonNegativeNumber,
} from '../utils/typeValidations.js';

export class Tarefa {
  constructor({
    id,
    titulo,
    data,
    economia,
    descricao,
    status,
    idProjeto,
    idCriador,
    idResponsavel,
    idAndamento,
    responsavel,
    comentarios,
    createdAt,
    updatedAt,
  }) {
    this.id = id ?? null;
    this.titulo = titulo;
    this.data = data ? new Date(data) : null;
    this.economia = economia ?? 0;
    this.descricao = descricao ?? '';
    this.status = status ?? 'pendente';
    this.idProjeto = idProjeto ?? null;
    this.idCriador = idCriador ?? null;
    this.idResponsavel = idResponsavel ?? null;
    this.idAndamento = idAndamento ?? null;
    this.responsavel = responsavel ?? null;
    this.comentarios = comentarios ?? [];
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();

    this.validate();
  }

  toJSON() {
    return {
      id: this.id,
      titulo: this.titulo,
      data: this.data ? this.data.toISOString() : null,
      economia: this.economia,
      descricao: this.descricao,
      status: this.status,
      idProjeto: this.idProjeto,
      idCriador: this.idCriador,
      idResponsavel: this.idResponsavel,
      idAndamento: this.idAndamento,
      responsavel:
        this.responsavel && typeof this.responsavel.toJSON === 'function'
          ? this.responsavel.toJSON()
          : this.responsavel,
      comentarios: Array.isArray(this.comentarios)
        ? this.comentarios.map((comentario) =>
            comentario && typeof comentario.toJSON === 'function'
              ? comentario.toJSON()
              : comentario
          )
        : this.comentarios,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  validate() {
    if (!isNonEmptyString(this.titulo)) {
      throw new TypeError('Título não pode ser uma string vazia');
    }

    if (!isNonNegativeNumber(this.economia)) {
      throw new TypeError('Economia deve ser um número não negativo');
    }

    if (!isNonEmptyString(this.status)) {
      throw new TypeError('Status não pode ser uma string vazia');
    }

    if (this.data !== null && !isDate(this.data)) {
      throw new TypeError('Data deve ser um objeto Date válido ou nulo');
    }

    if (!isDate(this.createdAt)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }

    if (!isDate(this.updatedAt)) {
      throw new TypeError('Data de atualização deve ser um objeto Date');
    }
  }
}
