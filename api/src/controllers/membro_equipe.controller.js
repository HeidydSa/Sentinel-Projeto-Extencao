import { ValidationError } from '../errors/validation.error.js';
import { isNumber } from '../utils/typeValidations.js';

export class MembroEquipeController {
  constructor(service) {
    this.service = service;
  }

  async create(req, res) {
    try {
      const { equipeId, usuarioId } = req.params;

      if (!isNumber(Number(equipeId)) || !isNumber(Number(usuarioId))) {
        res
          .status(400)
          .send({ message: 'equipeId e usuarioId devem ser números inteiros' });
      }

      const membro = await this.service.create({
        equipeId: Number(equipeId),
        usuarioId: Number(usuarioId),
      });
      return res.status(201).json(membro.toJSON());
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
      const { equipeId, usuarioId } = req.params;
      if (!isNumber(Number(equipeId)) || !isNumber(Number(usuarioId))) {
        res
          .status(400)
          .send({ message: 'equipeId e usuarioId devem ser números inteiros' });
      }
      const membro = await this.service.getById(
        Number(equipeId),
        Number(usuarioId)
      );

      if (!membro) {
        return res.status(404).json({ error: 'Membro não encontrado' });
      }

      return res.json(membro.toJSON());
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getAllByEquipe(req, res) {
    try {
      const { equipeId } = req.params;
      if (!isNumber(Number(equipeId))) {
        res
          .status(400)
          .send({ message: 'equipeId deve ser um número inteiro' });
      }
      const membros = await this.service.getAllByEquipe(Number(equipeId));
      return res.json(membros.map((membro) => membro.toJSON()));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { equipeId, usuarioId } = req.params;

      if (!isNumber(Number(equipeId)) || !isNumber(Number(usuarioId))) {
        res
          .status(400)
          .send({ message: 'equipeId e usuarioId devem ser números inteiros' });
      }
      const membro = await this.service.delete(
        Number(equipeId),
        Number(usuarioId)
      );

      if (!membro) {
        return res.status(404).json({ error: 'Membro não encontrado' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
