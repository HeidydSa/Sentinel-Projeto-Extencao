export class AuthClient {
  baseUrl;
  constructor({ path }) {
    this.baseUrl = 'https://sentinel-service.duckdns.org/auth';
  }

  async login(email, senha) {
    const response = await fetch(url + '/login', {
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

    return response.json();
  }
  async register(payload) {
    const response = await fetch(url + '/register', {
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
