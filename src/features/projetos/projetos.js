/* exported render, esc, toggleMenu */

import {
  getState,
  projetosAtivos,
  economiaPorProjeto,
  formatCurrency,
} from '../../state.js';

async function render() {
  const s = await getState();
  document.getElementById('sb-avatar').textContent = s.usuario.iniciais;
  document.getElementById('sb-nome').textContent = s.usuario.nome;

  const grid = document.getElementById('projetos-grid');
  const ativos = projetosAtivos(s);

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

export { render, esc, toggleMenu, minimizeMenu };
