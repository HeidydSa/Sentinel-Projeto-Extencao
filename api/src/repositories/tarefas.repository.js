import { Tarefa } from '../models/Tarefa.model.js';

export class TarefaRepository {
  constructor({ db, usuarioRepository, comentarioRepository }) {
    this.db = db;
    this.usuarioRepository = usuarioRepository;
    this.comentarioRepository = comentarioRepository;
  }

  async getAll() {
    const result = await this.db.query('SELECT * FROM tarefa');
    return result.rows.map((row) => this.fromPersisted(row));
  }

  async getById(id) {
    const query = 'SELECT * FROM tarefa WHERE id = $1';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async create(tarefa) {
    if (!(tarefa instanceof Tarefa)) {
      throw new TypeError('`tarefa` deve ser uma instância da classe Tarefa');
    }

    const query = `
      INSERT INTO tarefa (
        titulo, data, economia, descricao, status,
        id_projeto, id_criador, id_responsavel, id_andamento
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      tarefa.titulo,
      tarefa.data,
      tarefa.economia,
      tarefa.descricao,
      tarefa.status,
      tarefa.idProjeto,
      tarefa.idCriador,
      tarefa.idResponsavel,
      tarefa.idAndamento,
    ]);

    return this.fromPersisted(result.rows[0]);
  }

  async update(id, tarefa) {
    if (!(tarefa instanceof Tarefa)) {
      throw new TypeError('`tarefa` deve ser uma instância da classe Tarefa');
    }

    const query = `
      UPDATE tarefa
      SET
        titulo = $2,
        data = $3,
        economia = $4,
        descricao = $5,
        status = $6,
        id_projeto = $7,
        id_criador = $8,
        id_responsavel = $9,
        id_andamento = $10
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, [
      id,
      tarefa.titulo,
      tarefa.data,
      tarefa.economia,
      tarefa.descricao,
      tarefa.status,
      tarefa.idProjeto,
      tarefa.idCriador,
      tarefa.idResponsavel,
      tarefa.idAndamento,
    ]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async delete(id) {
    const query = 'DELETE FROM tarefa WHERE id = $1 RETURNING *';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  fromPersisted(data) {
    return new Tarefa({
      id: data.id,
      titulo: data.titulo,
      data: data.data,
      economia: data.economia,
      idProjeto: data.id_projeto,
      idCriador: data.id_criador,
      idResponsavel: data.id_responsavel,
      idAndamento: data.id_andamento,
      status: data.status,
      responsavel: data.responsavel,
      descricao: data.descricao,
      comentarios: data.comentarios,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }
}
