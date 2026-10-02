import { global } from '../config/global.js';
import { isNonEmptyString } from '../utils/typeValidations.js';

export class AuthClient {
  baseUrl;
  constructor() {
    this.baseUrl = global.API_URL + '/auth';
  }

  async login(email, senha) {
    const response = await fetch(this.baseUrl + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        senha,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Não foi possível realizar o login: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!isNonEmptyString(data.jwtToken)) {
      throw new Error('Token recebido pela API é inválido');
    }

    localStorage.setItem('auth_token', data.jwtToken);
  }
  async register(payload) {
    const response = await fetch(this.baseUrl + '/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload.toJSON(),
    });

    if (!response.ok) {
      throw new Error(
        `Não foi possível cadastrar o usuário: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}
