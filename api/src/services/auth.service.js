import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { InvalidCredentialsError } from '../errors/invalid_credentials.error.js';
import { ValidationError } from '../errors/validation.error.js';

export class AuthService {
  constructor(repository, usuarioService) {
    this.repository = repository;
    this.usuarioService = usuarioService;
  }

  async login(email, senha) {
    const usuario = await this.repository.getByEmail(email);

    if (!usuario || !(await this.doesPasswordMatch(senha, usuario.senha))) {
      throw new InvalidCredentialsError('Credênciais incorretas');
    }

    const jwtToken = jwt.sign(
      { email: usuario.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '2h',
      }
    );

    return { jwtToken };
  }

  async register(payload) {
    const { email, senha } = payload;

    if (!email || !senha) {
      throw new ValidationError('Email e senha são obrigatórios');
    }

    const usuario = await this.repository.getByEmail(email);

    if (usuario) {
      throw new Error('Usuário já existe.');
    }

    const hashSenha = await bcrypt.hash(senha, 10);

    const usuarioCriado = await this.usuarioService.create({
      ...payload,
      senha: hashSenha,
    });

    return usuarioCriado.id;
  }

  async doesPasswordMatch(senha, hashedPassword) {
    return await bcrypt.compare(senha, hashedPassword);
  }

  generateToken(user) {
    const payload = { id: user.id, email: user.email };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
  }
}
