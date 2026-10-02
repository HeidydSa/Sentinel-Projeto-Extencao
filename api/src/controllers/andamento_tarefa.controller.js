import { ValidationError } from '../errors/validation.error.js';

export class AndamentoTarefaController {
  constructor(service) {
    this.service = service;
  }

  async create(req, res) {
    try {
      const andamento = await this.service.create(req.body);
      return res.status(201).json(andamento);
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
      const andamento = await this.service.getById(Number(id));

      if (!andamento) {
        return res.status(404).json({ error: 'Andamento não encontrado' });
      }

      return res.json(andamento);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getAll(req, res) {
    try {
      const andamentos = await this.service.getAll();
      return res.json(andamentos);
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
      const andamento = await this.service.update(Number(id), req.body);

      if (!andamento) {
        return res.status(404).json({ error: 'Andamento não encontrado' });
      }

      return res.json(andamento);
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
      const andamento = await this.service.delete(Number(id));

      if (!andamento) {
        return res.status(404).json({ error: 'Andamento não encontrado' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
