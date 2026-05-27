/* eslint-disable no-unused-vars */
/* global getState, projetosAtivos, economiaPorProjeto, formatCurrency */
/* exported render, esc, toggleMenu */

function render() {
  const s = getState();
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
        (t) => t.projetoId === p.id && t.coluna !== 'finalizado'
      ).length;
      const badgeCls =
        p.status === 'em produção'
          ? 'status-badge--producao'
          : 'status-badge--naoiniciado';
      const badgeTxt =
        p.status === 'em produção' ? 'Em produção' : 'Não iniciado';

      return `
      <article class="projeto-card" role="listitem" tabindex="0" aria-labelledby="p-${p.id}">
        <h3 id="p-${p.id}" class="projeto-nome">${esc(p.nome)}</h3>
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
  document.getElementById('sidebar').classList.toggle('sidebar--open');
}

render();
