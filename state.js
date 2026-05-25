// ============================================================
// state.js — Estado global compartilhado entre todas as páginas
// ============================================================

const DEFAULT_STATE = {
  projetos: [
    { id: 'p1', nome: 'Projeto 01', status: 'em produção' },
    { id: 'p2', nome: 'Projeto 02', status: 'em produção' },
    { id: 'p3', nome: 'Projeto 03', status: 'não iniciado' },
  ],
  tarefas: [
    { id: 't1', titulo: 'Tarefa 01', data: '2026-05-05', economia: 100,   projetoId: 'p1', responsavel: 'He', coluna: 'afazer'     },
    { id: 't2', titulo: 'Tarefa 02', data: '2026-05-01', economia: 350,   projetoId: 'p1', responsavel: 'Ad', coluna: 'finalizado'  },
    { id: 't3', titulo: 'Tarefa 03', data: '2026-04-05', economia: 2000,  projetoId: 'p2', responsavel: 'He', coluna: 'iniciado'    },
    { id: 't4', titulo: 'Tarefa 04', data: '2026-05-10', economia: 1000,  projetoId: 'p3', responsavel: 'Al', coluna: 'afazer'     },
  ],
  usuario: { nome: 'Heidy de Sá', iniciais: 'He' }
};

const STATE_KEY = 'upscale_state';

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_STATE));
  } catch { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
}

function saveState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function getState() { return loadState(); }

function setState(updater) {
  const s = loadState();
  updater(s);
  saveState(s);
}

// ── DERIVAÇÕES ──────────────────────────────────────────────

function projetosAtivos(state) {
  return state.projetos.filter(p => p.status === 'em produção' || p.status === 'não iniciado');
}

function tarefasAtivas(state) {
  return state.tarefas.filter(t => t.coluna !== 'finalizado');
}

function economiaTotal(state) {
  return state.tarefas.reduce((sum, t) => sum + (t.economia || 0), 0);
}

function economiaPorProjeto(state, projetoId) {
  return state.tarefas
    .filter(t => t.projetoId === projetoId)
    .reduce((sum, t) => sum + (t.economia || 0), 0);
}

function tarefasFinalizadas(state) {
  return state.tarefas.filter(t => t.coluna === 'finalizado');
}

function formatCurrency(val) {
  return 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
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
