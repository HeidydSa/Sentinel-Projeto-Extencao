import { ValidationError } from '../errors/validation.error.js';

export class ProjetoController {
  constructor(service) {
    this.service = service;
  }

  async create(req, res) {
    try {
      const projeto = await this.service.create(req.body);
      return res.status(201).json(projeto);
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
      const projeto = await this.service.getById(Number(id));

      if (!projeto) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }

      return res.json(projeto);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getAll(req, res) {
    try {
      const projetos = await this.service.getAll();
      return res.json(projetos);
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

      const projeto = await this.service.update(Number(id), req.body);

      if (!projeto) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }

      return res.json(projeto);
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

      const projeto = await this.service.delete(Number(id));

      if (!projeto) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
