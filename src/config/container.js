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

const andamentoTarefasFirestore = new AndamentoTarefaFirestore(firebase);
const equipesFirestore = new EquipeFirestore(firebase);
const funcoesFirestore = new FuncaoFirestore(firebase);
// const membroEquipeFirestore = new MembroEquipeFirestore(firebase);'
const projetosFirestore = new ProjetoFirestore(firebase);
const usuariosFirestore = new UsuarioFirestore(firebase);
const tarefasFirestore = new TarefaFirestore(firebase, usuariosFirestore);

export const equipesService = new EquipeService(equipesFirestore);
export const funcoesService = new FuncaoService(funcoesFirestore);
export const projetosService = new ProjetoService(projetosFirestore);
export const tarefasService = new TarefaService(tarefasFirestore);
export const usuariosService = new UsuarioService(usuariosFirestore);
export const andamentoTarefasService = new AndamentoTarefaService(
  andamentoTarefasFirestore
);
