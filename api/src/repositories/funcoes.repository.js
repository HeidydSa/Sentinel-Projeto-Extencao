import { Funcao } from '../models/Funcao.model.js';

export class FuncaoRepository {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const result = await this.db.query('SELECT * FROM funcao');
    return result.rows.map((row) => this.fromPersisted(row));
  }

  async getById(id) {
    const query = 'SELECT * FROM funcao WHERE id = $1';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async create(funcao) {
    if (!(funcao instanceof Funcao)) {
      throw new TypeError('`funcao` deve ser uma instância da classe Funcao');
    }

    const query = `
      INSERT INTO funcao (tipo)
      VALUES ($1)
      RETURNING *
    `;

    const result = await this.db.query(query, [funcao.tipo]);

    return this.fromPersisted(result.rows[0]);
  }

  async update(id, funcao) {
    if (!(funcao instanceof Funcao)) {
      throw new TypeError('`funcao` deve ser uma instância da classe Funcao');
    }

    const query = `
      UPDATE funcao
      SET tipo = $2
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, [id, funcao.tipo]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async delete(id) {
    const query = 'DELETE FROM funcao WHERE id = $1 RETURNING *';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  fromPersisted(data) {
    return new Funcao({
      id: data.id,
      tipo: data.tipo,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }
}
