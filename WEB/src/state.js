import {
  projetosService,
  equipesService,
  funcoesService,
  andamentoTarefasService,
  usuariosService,
  tarefasService,
} from './config/container.js';
import { EnumStatusProjeto } from './utils/enums.js';
import { auth } from './config/db_config.js';

const DEFAULT_STATE = {
  projetos: [],
  funcoes: [],
  equipes: [],
  andamentoTarefas: [],
  tarefas: [],
  usuarios: [],
  usuario: { nome: 'Heidy de Sá', iniciais: 'He' },
};

let state = null;

async function loadState() {
  try {
    const [projetos, tarefas, equipes, funcoes, andamentoTarefas, usuarios] =
      await Promise.all([
        projetosService.getAll(),
        tarefasService.getAll(),
        equipesService.getAll(),
        funcoesService.getAll(),
        andamentoTarefasService.getAll(),
        usuariosService.getAll(),
      ]);
    return {
      projetos,
      tarefas,
      equipes,
      funcoes,
      andamentoTarefas,
      usuarios,
      usuario: { nome: 'Heidy de Sá', iniciais: 'He' },
    };
  } catch (error) {
    console.error('Erro ao carregar o estado:', error.message);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

async function getState() {
  state = await loadState();
  return state;
}

function getLocalState() {
  return state;
}

function setState(updater) {
  updater(state);
  return state;
}

// ── DERIVAÇÕES ──────────────────────────────────────────────

//Configuração do botao de entrar
const btnEntrar = document.getElementById('btnEntrar');

if (btnEntrar) {
  btnEntrar.onclick = () => {
    if (auth.currentUser) {
      location.href = './features/tarefas/tarefas.html';
    } else {
      location.href = './features/login/login.html';
    }
  };
}

function projetosAtivos(state) {
  return state.projetos.filter(
    (p) =>
      p.status === EnumStatusProjeto.EM_PRODUCAO ||
      p.status === EnumStatusProjeto.NAO_INICIADO
  );
}

function tarefasAtivas(state) {
  return state.tarefas.filter((t) => t.status !== 'finalizado');
}

function economiaTotal(state) {
  return state.tarefas.reduce((sum, t) => sum + (t.economia || 0), 0);
}

function economiaPorProjeto(state, projetoId) {
  return state.tarefas
    .filter((t) => t.idProjeto === projetoId)
    .reduce((sum, t) => sum + (t.economia || 0), 0);
}

function tarefasFinalizadas(state) {
  return state.tarefas.filter((t) => t.status === 'finalizado');
}

function formatCurrency(val) {
  return (
    'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  );
}

function formatDateDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

function uid() {
  return 't' + Date.now() + Math.random().toString(36).slice(2, 6);
}

function pidNew() {
  return 'p' + Date.now() + Math.random().toString(36).slice(2, 6);
}

if (typeof window !== 'undefined') {
  Object.assign(window, {
    getState,
    getLocalState,
    setState,
    projetosAtivos,
    tarefasAtivas,
    economiaTotal,
    economiaPorProjeto,
    tarefasFinalizadas,
    formatCurrency,
    formatDateDisplay,
    uid,
    pidNew,
  });
}

export {
  loadState,
  getState,
  getLocalState,
  setState,
  projetosAtivos,
  tarefasAtivas,
  economiaTotal,
  economiaPorProjeto,
  tarefasFinalizadas,
  formatCurrency,
  formatDateDisplay,
  uid,
  pidNew,
};
