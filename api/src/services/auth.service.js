import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { InvalidCredentialsError } from '../errors/invalid_credentials.error.js';
import { ValidationError } from '../errors/validation.error.js';

export class AuthService {
  constructor(repository, usuarioService) {
    this.repository = repository;
    this.usuarioService = usuarioService;
  }
  async login(email, senha) {
    if (
      typeof email !== 'string' ||
      typeof senha !== 'string' ||
      !email.trim() ||
      !senha
    )
      throw new ValidationError('Email e senha são obrigatórios.');
    const usuario = await this.repository.getByEmail(
      email.trim().toLowerCase()
    );
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha)))
      throw new InvalidCredentialsError('E-mail ou senha inválidos.');
    return {
      jwtToken: jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      ),
    };
  }
  async roles() {
    return (await this.repository.getRoles()).filter(
      (role) => !/admin/i.test(role.tipo)
    );
  }
  async register(payload) {
    const { nome, sobrenome, email, senha, funcaoId } = payload;
    if (typeof senha !== 'string' || senha.length < 8)
      throw new ValidationError('A senha deve ter pelo menos 8 caracteres.');
    if (typeof email !== 'string')
      throw new ValidationError('Email é obrigatório.');
    const roleId = Number(funcaoId);
    if (!(await this.roles()).some((role) => Number(role.id) === roleId))
      throw new ValidationError('Função inválida para cadastro.');
    const normalizedEmail = email.trim().toLowerCase();
    if (await this.repository.getByEmail(normalizedEmail))
      throw new ValidationError('E-mail já cadastrado.');
    const user = await this.usuarioService.create({
      nome,
      sobrenome,
      email: normalizedEmail,
      senha: await bcrypt.hash(senha, 10),
      funcaoId: roleId,
    });
    return { id: user.id };
  }
  async current(claims) {
    const user = await this.repository.getByEmail(claims.email);
    if (!user)
      throw new InvalidCredentialsError('Sessão inválida. Entre novamente.');
    return user;
  }
  async profile(claims, payload) {
    const user = await this.current(claims);
    return this.usuarioService.update(user.id, {
      ...user,
      nome: payload.nome,
      sobrenome: payload.sobrenome,
    });
  }
  async removeAccount(claims) {
    const user = await this.current(claims);
    return this.usuarioService.delete(user.id);
  }
}
