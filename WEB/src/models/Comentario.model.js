export class Comentario {
  constructor({ id, idUsuario, detalhe, dataCriacao }) {
    this.id = id ?? '';
    this.idUsuario = idUsuario;
    this.detalhe = detalhe;
    this.dataCriacao = dataCriacao ? new Date(dataCriacao) : new Date();
  }

  toPersisted() {
    return {
      id: this.id,
      id_usuario: this.idUsuario,
      detalhe: this.detalhe,
      data_criacao: this.dataCriacao.toISOString(),
    };
  }
}
