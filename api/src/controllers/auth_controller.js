import { InvalidCredentialsError } from '../errors/invalid_credentials.error.js';
import { ValidationError } from '../errors/validation.error.js';

export class AuthController {
  constructor(service) {
    this.service = service;
  }
  error(res, error) {
    if (error instanceof InvalidCredentialsError)
      return res.status(401).json({ error: error.message });
    if (error instanceof ValidationError)
      return res.status(400).json({ error: error.message });
    if (error.code === '23505')
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
  async register(req, res) {
    try {
      return res.status(201).json(await this.service.register(req.body));
    } catch (error) {
      return this.error(res, error);
    }
  }
  async login(req, res) {
    try {
      return res.json(await this.service.login(req.body.email, req.body.senha));
    } catch (error) {
      return this.error(res, error);
    }
  }
  async roles(_req, res) {
    try {
      return res.json(await this.service.roles());
    } catch (error) {
      return this.error(res, error);
    }
  }
  async me(req, res) {
    try {
      return res.json((await this.service.current(req.user)).toJSON());
    } catch (error) {
      return this.error(res, error);
    }
  }
  async profile(req, res) {
    try {
      return res.json(
        (await this.service.profile(req.user, req.body)).toJSON()
      );
    } catch (error) {
      return this.error(res, error);
    }
  }
  async removeAccount(req, res) {
    try {
      await this.service.removeAccount(req.user);
      return res.status(204).send();
    } catch (error) {
      return this.error(res, error);
    }
  }
}
