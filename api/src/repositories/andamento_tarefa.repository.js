import { AndamentoTarefa } from '../models/AndamentoTarefa.model.js';

export class AndamentoTarefaRepository {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const query = 'SELECT * FROM andamento_tarefa ORDER BY ordem ASC';
    const result = await this.db.query(query);
    return result.rows.map((row) => this.fromPersisted(row));
  }

  async getById(id) {
    const query = 'SELECT * FROM andamento_tarefa WHERE id = $1';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async create(andamentoTarefa) {
    if (!(andamentoTarefa instanceof AndamentoTarefa)) {
      throw new TypeError(
        '`andamentoTarefa` deve ser uma instância da classe AndamentoTarefa'
      );
    }

    const query = `
      INSERT INTO andamento_tarefa (titulo, ordem)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      andamentoTarefa.titulo,
      andamentoTarefa.ordem,
    ]);

    return this.fromPersisted(result.rows[0]);
  }

  async update(id, andamentoTarefa) {
    if (!(andamentoTarefa instanceof AndamentoTarefa)) {
      throw new TypeError(
        '`andamentoTarefa` deve ser uma instância da classe AndamentoTarefa'
      );
    }

    const query = `
      UPDATE andamento_tarefa
      SET
        titulo = $2,
        ordem = $3
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, [
      id,
      andamentoTarefa.titulo,
      andamentoTarefa.ordem,
    ]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async delete(id) {
    const query = 'DELETE FROM andamento_tarefa WHERE id = $1 RETURNING *';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  fromPersisted(data) {
    return new AndamentoTarefa({
      id: data.id,
      titulo: data.titulo,
      ordem: data.ordem,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }
}
