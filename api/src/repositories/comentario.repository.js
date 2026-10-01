import { Comentario } from '../models/Comentario.model.js';

export class ComentarioRepository {
  constructor({ db }) {
    this.db = db;
  }

  async getAll(tarefaId) {
    const query = `
      SELECT * FROM comentario
      WHERE id_tarefa = $1
      ORDER BY created_at ASC
    `;

    const result = await this.db.query(query, [tarefaId]);

    return result.rows.map((row) => this.fromPersisted(row));
  }

  async getById(tarefaId, comentarioId) {
    const query = `
      SELECT * FROM comentario
      WHERE id = $1 AND id_tarefa = $2
    `;

    const result = await this.db.query(query, [comentarioId, tarefaId]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async create(tarefaId, comentario) {
    if (!(comentario instanceof Comentario)) {
      throw new TypeError(
        '`comentario` deve ser uma instância da classe Comentario'
      );
    }

    const query = `
      INSERT INTO comentario (id_tarefa, id_usuario, detalhe)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      tarefaId,
      comentario.idUsuario,
      comentario.detalhe ?? '',
    ]);

    return this.fromPersisted(result.rows[0]);
  }

  async delete(tarefaId, comentarioId) {
    const query = `
      DELETE FROM comentario
      WHERE id = $1 AND id_tarefa = $2
      RETURNING *
    `;

    const result = await this.db.query(query, [comentarioId, tarefaId]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  fromPersisted(data) {
    if (data instanceof Comentario) {
      return data;
    }

    return new Comentario({
      id: data.id,
      idUsuario: data.id_usuario ?? data.idUsuario,
      detalhe: data.detalhe ?? '',
      createdAt: data.created_at ?? data.createdAt,
    });
  }
}
