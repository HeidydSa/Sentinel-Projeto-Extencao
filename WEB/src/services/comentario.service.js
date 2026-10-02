export class ComentarioService {
  constructor(client) {
    this.client = client;
  }

  async getAll(tarefaId) {
    return await this.client.getAll(tarefaId);
  }

  async create(tarefaId, comentario) {
    return await this.client.create(tarefaId, comentario);
  }

  async delete(tarefaId, comentarioId) {
    return await this.client.delete(tarefaId, comentarioId);
  }
}
