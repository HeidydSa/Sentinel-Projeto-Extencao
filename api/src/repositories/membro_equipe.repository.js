import { MembroEquipe } from '../models/MembroEquipe.model.js';

export class MembroEquipeRepository {
  constructor(db) {
    this.db = db;
  }

  async create(membroEquipe) {
    if (!(membroEquipe instanceof MembroEquipe)) {
      throw new TypeError(
        '`membroEquipe` deve ser uma instância da classe MembroEquipe'
      );
    }

    const query = `
      INSERT INTO membro_equipe (equipe_id, usuario_id)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      membroEquipe.equipeId,
      membroEquipe.usuarioId,
    ]);

    return this.fromPersisted(result.rows[0]);
  }

  async getById(equipeId, usuarioId) {
    const query = `
      SELECT * FROM membro_equipe
      WHERE equipe_id = $1 AND usuario_id = $2
    `;

    const result = await this.db.query(query, [equipeId, usuarioId]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async getAllByEquipe(equipeId) {
    const query = 'SELECT * FROM membro_equipe WHERE equipe_id = $1';
    const result = await this.db.query(query, [equipeId]);

    return result.rows.map((row) => this.fromPersisted(row));
  }

  async delete(equipeId, usuarioId) {
    const query = `
      DELETE FROM membro_equipe
      WHERE equipe_id = $1 AND usuario_id = $2
      RETURNING *
    `;

    const result = await this.db.query(query, [equipeId, usuarioId]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  fromPersisted(data) {
    return new MembroEquipe({
      equipeId: data.equipe_id,
      usuarioId: data.usuario_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }
}
