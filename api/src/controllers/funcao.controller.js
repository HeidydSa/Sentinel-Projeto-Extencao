import { ValidationError } from '../errors/validation.error.js';

export class FuncaoController {
  constructor(service) {
    this.service = service;
  }

  async create(req, res) {
    try {
      const funcao = await this.service.create(req.body);
      return res.status(201).json(funcao);
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
      const funcao = await this.service.getById(Number(id));

      if (!funcao) {
        return res.status(404).json({ error: 'Função não encontrada' });
      }

      return res.json(funcao);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getAll(req, res) {
    try {
      const funcoes = await this.service.getAll();
      return res.json(funcoes);
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
      const funcao = await this.service.update(Number(id), req.body);

      if (!funcao) {
        return res.status(404).json({ error: 'Função não encontrada' });
      }

      return res.json(funcao);
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
      const funcao = await this.service.delete(Number(id));

      if (!funcao) {
        return res.status(404).json({ error: 'Função não encontrada' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
