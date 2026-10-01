import { AndamentoTarefaFirestore } from '../repositories/andamento_tarefa.repository.js';
import { firebase } from './db_config.js';
import { AndamentoTarefaService } from '../services/andamento_tarefas.service.js';
import { EquipeRepository } from '../repositories/equipes.repository.js';
import { FuncaoRepository } from '../repositories/funcoes.repository.js';
// import { MembroEquipeFirestore } from '../firestore/membro_equipe.firestore.js';
import { ProjetoFirestore } from '../repositories/projetos.repository.js';
import { TarefaFirestore } from '../repositories/tarefas.repository.js';
import { UsuarioFirestore } from '../repositories/usuarios.repository.js';
import { FuncaoService } from '../services/funcoes.service.js';
import { ProjetoService } from '../services/projetos.service.js';
import { TarefaService } from '../services/tarefas.service.js';
import { UsuarioService } from '../services/usuarios.service.js';
import { EquipeService } from '../services/equipes.service.js';
import { db } from './db_config.js';
import { ComentarioRepository } from '../repositories/comentario.repository.js';
import { ComentarioService } from '../services/comentario.service.js';

const andamentoTarefaFirestore = new AndamentoTarefaFirestore(firebase);
const equipeFirestore = new EquipeRepository(firebase);
const funcaoFirestore = new FuncaoRepository(firebase);
// const membroEquipeFirestore = new MembroEquipeFirestore(firebase);'
const projetoFirestore = new ProjetoFirestore(firebase);
const usuarioFirestore = new UsuarioFirestore(firebase);
const comentarioFirestore = new ComentarioRepository({ firebase, db });
const tarefaFirestore = new TarefaFirestore({
  firebase,
  db,
  usuarioFirestore,
  comentarioFirestore,
});

export const comentarioService = new ComentarioService(comentarioFirestore);
export const equipesService = new EquipeService(equipeFirestore);
export const funcoesService = new FuncaoService(funcaoFirestore);
export const projetosService = new ProjetoService(projetoFirestore);
export const tarefasService = new TarefaService(tarefaFirestore);
export const usuariosService = new UsuarioService(usuarioFirestore);
export const andamentoTarefasService = new AndamentoTarefaService(
  andamentoTarefaFirestore
);
