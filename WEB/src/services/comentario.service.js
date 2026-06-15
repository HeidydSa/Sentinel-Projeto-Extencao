export class ComentarioService {
  constructor(comentarioFirestore) {
    this.comentarioFirestore = comentarioFirestore;
  }

  async getAll(tarefaId) {
    return await this.comentarioFirestore.getAll(tarefaId);
  }

  async create(tarefaId, comentario) {
    return await this.comentarioFirestore.create(tarefaId, comentario);
  }

  async delete(tarefaId, comentarioId) {
    return await this.comentarioFirestore.delete(tarefaId, comentarioId);
  }
}
