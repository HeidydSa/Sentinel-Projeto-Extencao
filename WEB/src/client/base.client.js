import { global } from '../config/global.js';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export class BaseClient {
  constructor({ path, map = (value) => value }) {
    this.baseUrl = global.API_URL.replace(/\/$/, '') + path;
    this.map = map;
  }
  async request(
    path = '',
    { method = 'GET', payload, authenticated = true } = {}
  ) {
    const token = localStorage.getItem('auth_token');
    let response;
    try {
      response = await fetch(this.baseUrl + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authenticated && token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new ApiError(
        'Não foi possível acessar o servidor. Verifique a conexão e tente novamente.',
        0
      );
    }
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    if (!response.ok) {
      if (response.status === 401 && authenticated) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      throw new ApiError(
        response.status >= 500
          ? 'O servidor está indisponível. Tente novamente mais tarde.'
          : data?.error ||
              data?.message ||
              `A requisição falhou (${response.status}).`,
        response.status
      );
    }
    if (text && data === null)
      throw new ApiError(
        'O servidor retornou uma resposta inválida.',
        response.status
      );
    return data;
  }
  async getAll() {
    const data = await this.request();
    if (!Array.isArray(data))
      throw new ApiError('A lista retornada pelo servidor é inválida.', 200);
    return data.map(this.map);
  }
  async getById(id) {
    return this.map(await this.request('/' + encodeURIComponent(id)));
  }
  async create(payload) {
    return this.map(await this.request('', { method: 'POST', payload }));
  }
  async update(id, payload) {
    return this.map(
      await this.request('/' + encodeURIComponent(id), {
        method: 'PUT',
        payload,
      })
    );
  }
  async delete(id) {
    return this.request('/' + encodeURIComponent(id), { method: 'DELETE' });
  }
}
