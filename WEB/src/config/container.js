import { AndamentoTarefasClient } from '../client/andamento_tarefa.client.js';
import { AndamentoTarefaService } from '../services/andamento_tarefas.service.js';
import { EquipesClient } from '../client/equipes.client.js';
import { FuncoesClient } from '../client/funcoes.client.js';
// import { MembroEquipesClient } from '../client/membro_equipe.client.js';
import { ProjetosClient } from '../client/projetos.client.js';
import { TarefasClient } from '../client/tarefas.client.js';
import { FuncaoService } from '../services/funcoes.service.js';
import { ProjetoService } from '../services/projetos.service.js';
import { TarefaService } from '../services/tarefas.service.js';
import { EquipeService } from '../services/equipes.service.js';
import { ComentariosClient } from '../client/comentarios.client.js';
import { ComentarioService } from '../services/comentario.service.js';
import { AuthClient } from '../client/auth.client.js';
import { AuthService } from '../services/auth_service.js';

const andamentoTarefasClient = new AndamentoTarefasClient();
const equipesClient = new EquipesClient();
const funcoesClient = new FuncoesClient();
// const membroEquipesClient = new MembroEquipesClient();'
const projetosClient = new ProjetosClient();
const comentariosClient = new ComentariosClient();
const tarefasClient = new TarefasClient();
const authClient = new AuthClient();

export const comentarioService = new ComentarioService(comentariosClient);
export const equipesService = new EquipeService(equipesClient);
export const funcoesService = new FuncaoService(funcoesClient);
export const projetosService = new ProjetoService(projetosClient);
export const tarefasService = new TarefaService(tarefasClient);
export const andamentoTarefasService = new AndamentoTarefaService(
  andamentoTarefasClient
);
export const authService = new AuthService(authClient);
