export class BaseClient {
  baseUrl;

  constructor({ path }) {
    this.baseUrl = 'https://sentinel-service.duckdns.org' + path;
  }

  getHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getAll() {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Requisição falhou com status ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async getById(id) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Requisição falhou com status ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async update(id, payload) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: payload.toJSON(),
    });

    if (!response.ok) {
      throw new Error(
        `Requisição falhou com status ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async create(payload) {
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: payload.toJSON(),
    });

    if (!response.ok) {
      throw new Error(
        `Requisição falhou com status ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async delete(id) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Requisição falhou com status ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}
