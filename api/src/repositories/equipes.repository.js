import { Equipe } from '../models/Equipe.model.js';

export class EquipeRepository {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const result = await this.db.query('SELECT * FROM equipe');
    return result.rows.map((row) => this.fromPersisted(row));
  }

  async getById(id) {
    const query = 'SELECT * FROM equipe WHERE id = $1';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async create(equipe) {
    if (!(equipe instanceof Equipe)) {
      throw new TypeError('`equipe` deve ser uma instância da classe Equipe');
    }

    const query = `
      INSERT INTO equipe (nome, id_lider)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await this.db.query(query, [equipe.nome, equipe.idLider]);

    return this.fromPersisted(result.rows[0]);
  }

  async update(id, equipe) {
    if (!(equipe instanceof Equipe)) {
      throw new TypeError('`equipe` deve ser uma instância da classe Equipe');
    }

    const query = `
      UPDATE equipe
      SET
        nome = $2,
        id_lider = $3
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, [
      id,
      equipe.nome,
      equipe.idLider,
    ]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async delete(id) {
    const query = 'DELETE FROM equipe WHERE id = $1 RETURNING *';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  fromPersisted(data) {
    return new Equipe({
      id: data.id,
      nome: data.nome,
      idLider: data.id_lider,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }
}
