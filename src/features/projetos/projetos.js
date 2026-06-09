/* exported render, esc, toggleMenu */

import {
  getState,
  projetosAtivos,
  economiaPorProjeto,
  formatCurrency,
} from '../../state.js';
import { auth, deleteUser } from '../../config/db_config.js';

async function render() {
  const s = await getState();

  //document.getElementById('sb-avatar').textContent = s.usuario.iniciais;
  //document.getElementById('sb-nome').textContent = s.usuario.nome;

  const grid = document.getElementById('projetos-grid');
  const ativos = projetosAtivos(s);

  const user = auth.currentUser;

  if (user) {
    const nome = user.displayName || user.email;

    document.getElementById('sb-nome').textContent = nome;

    const iniciais = nome.slice(0, 2).toUpperCase();

    document.getElementById('sb-avatar').textContent = iniciais;
  }

  if (ativos.length === 0) {
    grid.innerHTML = '<p class="empty-state">Nenhum projeto ativo.</p>';
    return;
  }

  grid.innerHTML = ativos
    .map((p) => {
      const econ = economiaPorProjeto(s, p.id);
      const tarefas = s.tarefas.filter(
        (t) => t.idProjeto === p.id && t.status !== 'finalizado'
      ).length;
      const badgeCls =
        p.status === 'em produção'
          ? 'status-badge--producao'
          : 'status-badge--naoiniciado';
      const badgeTxt =
        p.status === 'em produção' ? 'Em produção' : 'Não iniciado';

      return `
      <article class="projeto-card" role="listitem" tabindex="0" aria-labelledby="p-${p.id}">
        <h3 id="p-${p.id}" class="projeto-nome">${esc(p.descricao)}</h3>
        <dl class="projeto-info">
          <div><dt>Status</dt><dd><span class="status-badge ${badgeCls}">${badgeTxt}</span></dd></div>
          <div><dt>Economia total</dt><dd>${formatCurrency(econ)}</dd></div>
          <div><dt>Tarefas ativas</dt><dd>${tarefas}</dd></div>
        </dl>
      </article>`;
    })
    .join('');
}

async function deleteAccount() {
  const confirmDelete = confirm(
    'Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita.'
  );

  if (!confirmDelete) return;

  try {
    await deleteUser(auth.currentUser);

    alert('Conta excluida com sucesso.');

    location.href = '../login/login.html';
  } catch (error) {
    console.error(error);

    alert('Não foi possível excluir a conta.');
  }
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toggleMenu(btn) {
  const exp = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', !exp);
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('sidebar--open');
}

function minimizeMenu() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('minimized');
}

render();

if (typeof window !== 'undefined') {
  Object.assign(window, { render, esc, toggleMenu, minimizeMenu });
}

export { render, esc, toggleMenu, minimizeMenu, deleteAccount };
