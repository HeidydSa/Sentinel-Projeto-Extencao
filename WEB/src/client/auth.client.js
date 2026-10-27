import { BaseClient } from './base.client.js';
export class AuthClient extends BaseClient {
  constructor() {
    super({ path: '/auth' });
  }
  async login(email, senha) {
    const data = await this.request('/login', {
      method: 'POST',
      payload: { email, senha },
      authenticated: false,
    });
    if (typeof data?.jwtToken !== 'string' || !data.jwtToken)
      throw new Error('Token recebido pela API é inválido.');
    localStorage.setItem('auth_token', data.jwtToken);
    return data;
  }
  register(payload) {
    return this.request('/register', {
      method: 'POST',
      payload,
      authenticated: false,
    });
  }
  roles() {
    return this.request('/roles', { authenticated: false });
  }
  me() {
    return this.request('/me');
  }
  profile(payload) {
    return this.request('/me', { method: 'PUT', payload });
  }
  removeAccount() {
    return this.request('/me', { method: 'DELETE' });
  }
}
