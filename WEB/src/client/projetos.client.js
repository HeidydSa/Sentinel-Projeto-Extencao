import { BaseClient } from './base.client.js';
export class ProjetosClient extends BaseClient {
  constructor() {
    super({
      path: '/projetos',
    });
  }
}
