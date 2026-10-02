import { BaseClient } from './base.client.js';
export class FuncoesClient extends BaseClient {
  constructor() {
    super({
      path: '/funcoes',
    });
  }
}
