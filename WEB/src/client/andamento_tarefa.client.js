import { BaseClient } from './base.client.js';
export class AndamentoTarefasClient extends BaseClient {
  constructor() {
    super({
      path: '/andamentos',
    });
  }
}
