import { BaseClient } from './base.client.js';
import { Comentario } from '../models/Comentario.model.js';
export class ComentariosClient extends BaseClient {
  constructor() {
    super({ path: '/tarefas' });
  }
  async getAll(tarefaId) {
    const data = await this.request(
      '/' + encodeURIComponent(tarefaId) + '/comentarios'
    );
    return data.map((c) =>
      Object.assign(new Comentario({ ...c, idUsuario: Number(c.idUsuario) }), {
        id: String(c.id),
        idUsuario: String(c.idUsuario),
        dataCriacao: new Date(c.createdAt),
      })
    );
  }
  async create(tarefaId, comentario) {
    const result = await this.request(
      '/' + encodeURIComponent(tarefaId) + '/comentarios',
      {
        method: 'POST',
        payload: {
          ...comentario.toJSON(),
          id: null,
          idUsuario: Number(comentario.idUsuario),
        },
      }
    );
    return String(result.id);
  }
  delete(tarefaId, comentarioId) {
    return this.request(
      '/' +
        encodeURIComponent(tarefaId) +
        '/comentarios/' +
        encodeURIComponent(comentarioId),
      { method: 'DELETE' }
    );
  }
}
