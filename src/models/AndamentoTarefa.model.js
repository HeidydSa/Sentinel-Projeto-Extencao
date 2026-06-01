import {
  isDate,
  isNonEmptyString,
  isPositiveNumber,
} from '../utils/typeValidations';

export class AndamentoTarefa {
  constructor(id, titulo, ordem, dataCriacao) {
    this.id = id ?? '';
    this.titulo = titulo;
    this.ordem = ordem;
    this.dataCriacao = new Date(dataCriacao);

    this.validate();
  }

  validate() {
    if (!isNonEmptyString(this.titulo)) {
      throw new TypeError('Título não pode ser uma string vazia');
    }

    if (!isPositiveNumber(this.ordem)) {
      throw new TypeError('Ordem deve ser um número não negativo');
    }

    if (!isDate(this.dataCriacao)) {
      throw new TypeError('Data de criação deve ser um objeto Date');
    }
  }

  toPersisted() {
    return {
      id: this.id,
      titulo: this.titulo,
      ordem: this.ordem,
      dataCriacao: this.dataCriacao.toISOString(),
    };
  }
}
