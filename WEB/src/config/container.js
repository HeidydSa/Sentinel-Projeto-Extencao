import { AndamentoTarefaFirestore } from '../firestore/andamento_tarefa.firestore.js';
import { firebase } from './db_config.js';
import { AndamentoTarefaService } from '../services/andamento_tarefas.service.js';
import { EquipeFirestore } from '../firestore/equipes.firestore.js';
import { FuncaoFirestore } from '../firestore/funcoes.firestore.js';
// import { MembroEquipeFirestore } from '../firestore/membro_equipe.firestore.js';
import { ProjetoFirestore } from '../firestore/projetos.firestore.js';
import { TarefaFirestore } from '../firestore/tarefas.firestore.js';
import { UsuarioFirestore } from '../firestore/usuarios.firestore.js';
import { FuncaoService } from '../services/funcoes.service.js';
import { ProjetoService } from '../services/projetos.service.js';
import { TarefaService } from '../services/tarefas.service.js';
import { UsuarioService } from '../services/usuarios.service.js';
import { EquipeService } from '../services/equipes.service.js';
import { db } from './db_config.js';
import { ComentarioFirestore } from '../firestore/comentario.firestore.js';
import { ComentarioService } from '../services/comentario.service.js';

const andamentoTarefaFirestore = new AndamentoTarefaFirestore(firebase);
const equipeFirestore = new EquipeFirestore(firebase);
const funcaoFirestore = new FuncaoFirestore(firebase);
// const membroEquipeFirestore = new MembroEquipeFirestore(firebase);'
const projetoFirestore = new ProjetoFirestore(firebase);
const usuarioFirestore = new UsuarioFirestore(firebase);
const comentarioFirestore = new ComentarioFirestore({ firebase, db });
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
