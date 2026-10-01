import { Projeto } from '../models/Projeto.model.js';

export class ProjetoRepository {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const result = await this.db.query('SELECT * FROM projeto');
    return result.rows.map((row) => this.fromPersisted(row));
  }

  async getById(id) {
    const query = 'SELECT * FROM projeto WHERE id = $1';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async create(projeto) {
    if (!(projeto instanceof Projeto)) {
      throw new TypeError('`projeto` deve ser uma instância da classe Projeto');
    }

    const query = `
      INSERT INTO projeto (titulo, descricao, id_equipe, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      projeto.titulo,
      projeto.descricao,
      projeto.idEquipe,
      projeto.status,
    ]);

    return this.fromPersisted(result.rows[0]);
  }

  async update(id, projeto) {
    if (!(projeto instanceof Projeto)) {
      throw new TypeError('`projeto` deve ser uma instância da classe Projeto');
    }

    const query = `
      UPDATE projeto
      SET
        titulo = $2,
        descricao = $3,
        id_equipe = $4,
        status = $5
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, [
      id,
      projeto.titulo,
      projeto.descricao,
      projeto.idEquipe,
      projeto.status,
    ]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async delete(id) {
    const query = 'DELETE FROM projeto WHERE id = $1 RETURNING *';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  fromPersisted(data) {
    return new Projeto({
      id: data.id,
      titulo: data.titulo,
      descricao: data.descricao,
      idEquipe: data.id_equipe,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      status: data.status,
    });
  }
}
