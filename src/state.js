// ============================================================
// state.js — Estado global compartilhado entre todas as páginas
// ============================================================

/* exported getState, setState, projetosAtivos, tarefasAtivas, economiaTotal, economiaPorProjeto, tarefasFinalizadas, formatCurrency, formatDateDisplay, uid, pidNew */

// const DEFAULT_STATE = {
//   projetos: [
//     { id: 'p1', nome: 'Projeto 01', status: 'em produção' },
//     { id: 'p2', nome: 'Projeto 02', status: 'em produção' },
//     { id: 'p3', nome: 'Projeto 03', status: 'não iniciado' },
//   ],
//   tarefas: [
//     {
//       id: 't1',
//       titulo: 'Tarefa 01',
//       data: '2026-05-05',
//       economia: 100,
//       projetoId: 'p1',
//       responsavel: 'He',
//       coluna: 'afazer',
//     },
//     {
//       id: 't2',
//       titulo: 'Tarefa 02',
//       data: '2026-05-01',
//       economia: 350,
//       projetoId: 'p1',
//       responsavel: 'Ad',
//       coluna: 'finalizado',
//     },
//     {
//       id: 't3',
//       titulo: 'Tarefa 03',
//       data: '2026-04-05',
//       economia: 2000,
//       projetoId: 'p2',
//       responsavel: 'He',
//       coluna: 'iniciado',
//     },
//     {
//       id: 't4',
//       titulo: 'Tarefa 04',
//       data: '2026-05-10',
//       economia: 1000,
//       projetoId: 'p3',
//       responsavel: 'Al',
//       coluna: 'afazer',
//     },
//   ],
//   usuario: { nome: 'Heidy de Sá', iniciais: 'He' },
// };

import {
  projetosService,
  equipesService,
  funcoesService,
  andamentoTarefasService,
  usuariosService,
  tarefasService,
} from './config/container.js';

const DEFAULT_STATE = {
  projetos: [],
  funcoes: [],
  equipes: [],
  andamentoTarefas: [],
  tarefas: [],
  usuarios: [],
  usuario: { nome: 'Heidy de Sá', iniciais: 'He' },
};

const STATE_KEY = 'upscale_state';

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

async function saveState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

async function getState() {
  return await loadState();
}

async function setState(updater) {
  const s = await loadState();
  updater(s);
  await saveState(s);
}

// ── DERIVAÇÕES ──────────────────────────────────────────────

function projetosAtivos(state) {
  return state.projetos.filter(
    (p) => p.status === 'em produção' || p.status === 'não iniciado'
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
  saveState,
  getState,
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
