import { ValidationError } from '../errors/validation.error.js';

export class UsuarioController {
  constructor(service) {
    this.service = service;
  }

  async create(req, res) {
    try {
      const usuario = await this.service.create(req.body);
      return res.status(201).json(usuario.toJSON());
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(Number(id))) {
        res.status(400).send({ message: 'id deve ser um número inteiro' });
      }

      const usuario = await this.service.getById(Number(id));

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(usuario.toJSON());
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getAll(req, res) {
    try {
      const usuarios = await this.service.getAll();
      return res.json(usuarios.map((usuario) => usuario.toJSON()));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(Number(id))) {
        res.status(400).send({ message: 'id deve ser um número inteiro' });
      }

      const usuario = await this.service.update(Number(id), req.body);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(usuario.toJSON());
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(Number(id))) {
        res.status(400).send({ message: 'id deve ser um número inteiro' });
      }

      const usuario = await this.service.delete(Number(id));

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
