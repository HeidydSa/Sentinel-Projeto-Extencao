import { Usuario } from '../models/Usuario.model.js';
import { isNonEmptyString } from '../utils/typeValidations.js';

export class UsuarioService {
  constructor(client) {
    this.client = client;
  }

  async register(usuario) {
    if (!(usuario instanceof Usuario)) {
      throw new TypeError(`O objeto deve ser uma instância de Usuario`);
    }

    try {
      return await this.client.register(usuario);
    } catch (e) {
      console.error(`Não foi possível criar o usuário: ${e.message}`, e);
      throw e;
    }
  }

  async login(email, senha) {
    if (!isNonEmptyString(email) || !isNonEmptyString(senha)) {
      throw new TypeError(`Email e senha são obrigatórios`);
    }

    try {
      return await this.client.login(email, senha);
    } catch (e) {
      console.error(`Não foi possível criar o usuário: ${e.message}`, e);
      throw e;
    }
  }
}
