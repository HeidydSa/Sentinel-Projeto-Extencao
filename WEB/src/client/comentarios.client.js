import { BaseClient } from './base.client.js';
export class ComentariosClient extends BaseClient {
  constructor() {
    super({
      path: '/comentarios',
    });
  }
}
