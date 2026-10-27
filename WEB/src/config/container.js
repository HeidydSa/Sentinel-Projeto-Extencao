import { BaseClient } from '../client/base.client.js';
import { AndamentoTarefasClient } from '../client/andamento_tarefa.client.js';
import { EquipesClient } from '../client/equipes.client.js';
import { FuncoesClient } from '../client/funcoes.client.js';
import { ProjetosClient } from '../client/projetos.client.js';
import { TarefasClient } from '../client/tarefas.client.js';
import { ComentariosClient } from '../client/comentarios.client.js';
import { AuthClient } from '../client/auth.client.js';
import { AuthService } from '../services/auth_service.js';
import { AndamentoTarefaService } from '../services/andamento_tarefas.service.js';
import { FuncaoService } from '../services/funcoes.service.js';
import { ProjetoService } from '../services/projetos.service.js';
import { TarefaService } from '../services/tarefas.service.js';
import { UsuarioService } from '../services/usuarios.service.js';
import { EquipeService } from '../services/equipes.service.js';
import { ComentarioService } from '../services/comentario.service.js';
import { Projeto } from '../models/Projeto.model.js';
import { Tarefa } from '../models/Tarefa.model.js';
import { Usuario } from '../models/Usuario.model.js';

const id = (value) => (value == null ? null : String(value));
const projetosClient = new ProjetosClient();
projetosClient.map = (p) =>
  new Projeto({
    ...p,
    id: id(p.id),
    idEquipe: id(p.idEquipe),
    status: p.status === 'ativo' ? 'em_producao' : p.status,
  });
const tarefasClient = new TarefasClient();
tarefasClient.map = (t) =>
  new Tarefa({
    ...t,
    id: id(t.id),
    idProjeto: id(t.idProjeto),
    idCriador: id(t.idCriador),
    data: typeof t.data === 'string' ? t.data.slice(0, 10) : t.data,
    idResponsavel: id(t.idResponsavel),
    economia: Number(t.economia ?? 0),
    status: t.status === 'pendente' ? 'afazer' : t.status,
  });
export const comentarioService = new ComentarioService(new ComentariosClient());
export const equipesService = new EquipeService(new EquipesClient());
export const funcoesService = new FuncaoService(new FuncoesClient());
export const projetosService = new ProjetoService(projetosClient);
export const tarefasService = new TarefaService(tarefasClient);
export const usuariosService = new UsuarioService(
  new BaseClient({
    path: '/usuarios',
    map: (u) => new Usuario({ ...u, id: id(u.id), funcaoId: id(u.funcaoId) }),
  })
);
export const andamentoTarefasService = new AndamentoTarefaService(
  new AndamentoTarefasClient()
);
export const authService = new AuthService(new AuthClient());
