import { ValidationError } from '../errors/validation.error.js';

export class ComentarioController {
  constructor(service) {
    this.service = service;
  }

  async create(req, res) {
    try {
      const { tarefaId } = req.params;
      if (isNaN(Number(tarefaId))) {
        res
          .status(400)
          .send({ message: 'tarefaId deve ser um número inteiro' });
      }
      const comentario = await this.service.create(Number(tarefaId), req.body);
      return res.status(201).json(comentario);
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
      const { tarefaId, comentarioId } = req.params;
      if (isNaN(Number(tarefaId)) || isNaN(Number(comentarioId))) {
        res.status(400).send({
          message: 'tarefaId e comentarioId devem ser números inteiros',
        });
      }
      const comentario = await this.service.getById(
        Number(tarefaId),
        Number(comentarioId)
      );

      if (!comentario) {
        return res.status(404).json({ error: 'Comentário não encontrado' });
      }

      return res.json(comentario.toJSON());
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getAll(req, res) {
    try {
      const { tarefaId } = req.params;
      if (isNaN(Number(tarefaId))) {
        res
          .status(400)
          .send({ message: 'tarefaId deve ser um número inteiro' });
      }
      const comentarios = await this.service.getAll(Number(tarefaId));
      return res.json(comentarios.map((c) => c.toJSON()));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { tarefaId, comentarioId } = req.params;
      if (isNaN(Number(tarefaId)) || isNaN(Number(comentarioId))) {
        res.status(400).send({
          message: 'tarefaId e comentarioId devem ser números inteiros',
        });
      }
      const comentario = await this.service.delete(
        Number(tarefaId),
        Number(comentarioId)
      );

      if (!comentario) {
        return res.status(404).json({ error: 'Comentário não encontrado' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
