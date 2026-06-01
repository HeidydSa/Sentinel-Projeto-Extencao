import { AndamentoTarefaFirestore } from '../firestore/andamento_tarefa.firestore';
import * as firebase from 'firebase/firestore';
import { AndamentoTarefaService } from '../services/andamento_tarefas.service';
import { Equipe } from '../models/Equipe.model';
import { EquipeFirestore } from '../firestore/equipes.firestore';
import { FuncaoFirestore } from '../firestore/funcoes.firestore';
// import { MembroEquipeFirestore } from '../firestore/membro_equipe.firestore';
import { ProjetoFirestore } from '../firestore/projetos.firestore';
import { TarefaFirestore } from '../firestore/tarefas.firestore';
import { UsuarioFirestore } from '../firestore/usuarios.firestore';
import { FuncaoService } from '../services/funcoes.service';
import { ProjetoService } from '../services/projetos.service';
import { TarefaService } from '../services/tarefas.service';
import { UsuarioService } from '../services/usuarios.service';

const andamentoTarefasFirestore = new AndamentoTarefaFirestore(firebase);
const equipesFirestore = new EquipeFirestore(firebase);
const funcoesFirestore = new FuncaoFirestore(firebase);
// const membroEquipeFirestore = new MembroEquipeFirestore(firebase);
const projetosFirestore = new ProjetoFirestore(firebase);
const tarefasFirestore = new TarefaFirestore(firebase);
const usuariosFirestore = new UsuarioFirestore(firebase);

export const equipesService = new Equipe(equipesFirestore);
export const funcoesService = new FuncaoService(funcoesFirestore);
export const projetosService = new ProjetoService(projetosFirestore);
export const tarefasService = new TarefaService(tarefasFirestore);
export const usuariosService = new UsuarioService(usuariosFirestore);
export const andamentoTarefasService = new AndamentoTarefaService(
  andamentoTarefasFirestore
);
