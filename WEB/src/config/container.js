import { BaseClient } from '../client/base.client.js';
import { AuthClient } from '../client/auth.client.js';
import { Comentario } from '../models/Comentario.model.js';
import { Projeto } from '../models/Projeto.model.js';
import { Tarefa } from '../models/Tarefa.model.js';
import { Usuario } from '../models/Usuario.model.js';
import { ProjetoService } from '../services/projetos.service.js';
import { TarefaService } from '../services/tarefas.service.js';
import { UsuarioService } from '../services/usuarios.service.js';

const id = (value) => (value == null ? null : String(value));
const mapUsuario = (u) =>
  new Usuario({ ...u, id: id(u.id), funcaoId: id(u.funcaoId) });
const mapComentario = (c) =>
  Object.assign(new Comentario({ ...c, idUsuario: Number(c.idUsuario) }), {
    id: id(c.id),
    idUsuario: id(c.idUsuario),
    dataCriacao: new Date(c.createdAt),
  });
const mapTarefa = (t) =>
  new Tarefa({
    ...t,
    id: id(t.id),
    idProjeto: id(t.idProjeto),
    idCriador: id(t.idCriador),
    idResponsavel: id(t.idResponsavel),
    economia: Number(t.economia),
    status: t.status === 'pendente' ? 'afazer' : t.status,
    comentarios: (t.comentarios || []).map(mapComentario),
  });

export const authService = new AuthClient();
export const usuariosService = new UsuarioService(
  new BaseClient({ path: '/usuarios', map: mapUsuario })
);
export const projetosService = new ProjetoService(
  new BaseClient({
    path: '/projetos',
    map: (p) =>
      new Projeto({
        ...p,
        id: id(p.id),
        idEquipe: id(p.idEquipe),
        status: p.status === 'ativo' ? 'em_producao' : p.status,
      }),
  })
);
export const tarefasService = new TarefaService(
  new BaseClient({ path: '/tarefas', map: mapTarefa })
);
export const equipesService = new BaseClient({ path: '/equipes' });
export const funcoesService = new BaseClient({ path: '/funcoes' });
export const andamentoTarefasService = new BaseClient({ path: '/andamentos' });
export const comentarioService = {
  async getAll(tarefaId) {
    return new BaseClient({
      path: `/tarefas/${encodeURIComponent(tarefaId)}/comentarios`,
      map: mapComentario,
    }).getAll();
  },
  async create(tarefaId, comentario) {
    const client = new BaseClient({
      path: `/tarefas/${encodeURIComponent(tarefaId)}/comentarios`,
    });
    const result = await client.create({
      ...comentario.toJSON(),
      id: null,
      idUsuario: Number(comentario.idUsuario),
    });
    return String(result.id);
  },
  delete(tarefaId, comentarioId) {
    return new BaseClient({
      path: `/tarefas/${encodeURIComponent(tarefaId)}/comentarios`,
    }).delete(comentarioId);
  },
};
