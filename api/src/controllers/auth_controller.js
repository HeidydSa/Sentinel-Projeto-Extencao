import { InvalidCredentialsError } from '../errors/invalid_credentials.error.js';
import { ValidationError } from '../errors/validation.error.js';

export class AuthController {
  constructor(service) {
    this.service = service;
  }

  async register(req, res) {
    try {
      const usuario = await this.service.register(req.body);
      return res.status(201).json(usuario);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async login(req, res) {
    try {
      const { email, senha } = req.body;
      const resultado = await this.service.login(email, senha);
      return res.json(resultado);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof InvalidCredentialsError) {
        return res.status(403).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
