import { BaseClient } from './base.client.js';
export class EquipesClient extends BaseClient {
  constructor() {
    super({
      path: '/equipes',
    });
  }
}
