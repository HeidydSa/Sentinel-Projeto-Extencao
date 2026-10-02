import { Usuario } from '../models/Usuario.model.js';
import { Pool } from 'pg';

export class UsuarioRepository {
  constructor(db) {
    if (!(db instanceof Pool)) throw new Error('Unexpected DB type');
    this.db = db;
  }

  async getAll() {
    const result = await this.db.query('SELECT * FROM usuario');
    return result.rows.map((row) => this.fromPersisted(row));
  }

  async getById(id) {
    const query = 'SELECT * FROM usuario WHERE id = $1';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async getByEmail(email) {
    const query = 'SELECT * FROM usuario WHERE email = $1';
    const result = await this.db.query(query, [email]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async create(usuario) {
    if (!(usuario instanceof Usuario)) {
      throw new TypeError('`usuario` deve ser uma instância da classe Usuario');
    }

    const query = `
      INSERT INTO usuario (nome, sobrenome, email, senha, funcao_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      usuario.nome,
      usuario.sobrenome,
      usuario.email,
      usuario.senha,
      usuario.funcaoId,
    ]);

    return this.fromPersisted(result.rows[0]);
  }

  async update(id, usuario) {
    if (!(usuario instanceof Usuario)) {
      throw new TypeError('`usuario` deve ser uma instância da classe Usuario');
    }

    const query = `
      UPDATE usuario
      SET
        nome = $2,
        sobrenome = $3,
        email = $4,
        senha = $5,
        funcao_id = $6
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, [
      id,
      usuario.nome,
      usuario.sobrenome,
      usuario.email,
      usuario.senha,
      usuario.funcaoId,
    ]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  async delete(id) {
    const query = 'DELETE FROM usuario WHERE id = $1 RETURNING *';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) return null;

    return this.fromPersisted(result.rows[0]);
  }

  fromPersisted(data) {
    return new Usuario({
      id: data.id,
      nome: data.nome,
      sobrenome: data.sobrenome,
      email: data.email,
      senha: data.senha,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      funcaoId: data.funcao_id,
    });
  }
}
