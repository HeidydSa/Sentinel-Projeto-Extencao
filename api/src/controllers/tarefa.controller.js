import { ValidationError } from '../errors/validation.error.js';
import { isNumber } from '../utils/typeValidations.js';

export class TarefaController {
  constructor(service) {
    this.service = service;
  }

  async create(req, res) {
    try {
      const tarefa = await this.service.create(req.body);
      return res.status(201).json(tarefa.toJSON());
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

      const tarefa = await this.service.getById(Number(id));

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      return res.json(tarefa.toJSON());
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getAll(req, res) {
    try {
      const tarefas = await this.service.getAll();
      return res.json(tarefas.map((tarefa) => tarefa.toJSON()));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

      if (!isNumber(id)) {
        res.status(400).send({ message: 'id deve ser uma string' });
      }

      const tarefa = await this.service.update(Number(id), req.body);

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      return res.json(tarefa.toJSON());
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

      if (!isNumber(id)) {
        res.status(400).send({ message: 'id deve ser uma string' });
      }

      const tarefa = await this.service.delete(Number(id));

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
