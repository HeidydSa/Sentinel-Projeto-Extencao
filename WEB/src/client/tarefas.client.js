import { BaseClient } from './base.client.js';

export class TarefasClient extends BaseClient {
  constructor() {
    super({
      path: '/tarefas',
    });
  }
}
