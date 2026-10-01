import { ValidationError } from '../errors/validation.error.js';

export class EquipeController {
  constructor(service) {
    this.service = service;
  }

  async create(req, res) {
    try {
      const equipe = await this.service.create(req.body);
      return res.status(201).json(equipe);
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
      const equipe = await this.service.getById(Number(id));

      if (!equipe) {
        return res.status(404).json({ error: 'Equipe não encontrada' });
      }

      return res.json(equipe);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getAll(req, res) {
    try {
      const equipes = await this.service.getAll();
      return res.json(equipes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const equipe = await this.service.update(Number(id), req.body);

      if (!equipe) {
        return res.status(404).json({ error: 'Equipe não encontrada' });
      }

      return res.json(equipe);
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
      const equipe = await this.service.delete(Number(id));

      if (!equipe) {
        return res.status(404).json({ error: 'Equipe não encontrada' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
