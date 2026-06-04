/* exported render, renderCard, isLate, esc, toggleMoveMenu, moveCard, openEdit, closeModal, saveEdit, showToast, toggleMenu */

import { tarefasService } from '../../config/container.js';
import {
  getState,
  setState,
  projetosAtivos,
  tarefasAtivas,
  formatCurrency,
} from '../../state.js';

const COLUNAS = [
  { id: 'afazer', label: 'A FAZER', cls: 'afazer' },
  { id: 'iniciado', label: 'INICIADO', cls: 'iniciado' },
  { id: 'finalizado', label: 'FINALIZADO', cls: 'finalizado' },
  { id: 'espera', label: 'EM ESPERA', cls: 'espera' },
];

let s;

async function render(state = null) {
  if (state) {
    s = state;
  } else {
    s = await getState();
  }

  document.getElementById('kpi-projetos').textContent =
    projetosAtivos(s).length;
  document.getElementById('kpi-tarefas').textContent = tarefasAtivas(s).length;

  document.getElementById('sb-avatar').textContent = s.usuario.iniciais;
  document.getElementById('sb-nome').textContent = s.usuario.nome;

  const board = document.getElementById('kanban-board');
  board.innerHTML = '';

  COLUNAS.forEach((col) => {
    const cards = s.tarefas.filter((t) => t.status === col.id);
    const colEl = document.createElement('div');
    colEl.className = 'kanban-col';
    colEl.setAttribute('role', 'listitem');
    colEl.setAttribute('aria-labelledby', `col-${col.id}`);
    colEl.ondrop = (e) => handleDrop(e, col.id);
    colEl.ondragover = (e) => handleDragOver(e);
    colEl.ondragleave = (e) => handleDragLeave(e);

    colEl.innerHTML = `
      <div class="col-header">
        <h3 id="col-${col.id}" class="col-title col-title--${col.cls}">${col.label}</h3>
        <span class="col-count" aria-label="${cards.length} tarefas">${cards.length}</span>
      </div>
      <div class="kanban-cards" role="list" aria-label="Tarefas: ${col.label}">
        ${cards.length === 0 ? '<p class="empty-state">Nenhuma tarefa</p>' : cards.map((t) => renderCard(t, s)).join('')}
      </div>
    `;
    board.appendChild(colEl);
  });

  document
    .querySelectorAll('.move-menu.open')
    .forEach((m) => m.classList.remove('open'));
}

function renderCard(t, s) {
  const proj = s.projetos.find((p) => p.id === t.idProjeto);
  const projNome = proj ? proj.nome : '—';
  const dataClass = isLate(t)
    ? 'task-date--late'
    : t.status === 'finalizado'
      ? 'task-date--done'
      : '';
  const outrosCols = COLUNAS.filter((c) => c.id !== t.status);

  return `
    <article 
      class="task-card" 
      role="listitem" 
      tabindex="0" 
      aria-label="Tarefa: ${t.titulo}, ${projNome}" 
      draggable="true"
      ondragstart="event.dataTransfer.setData('text/plain', '${t.id}')"
    >
    
      <h4 class="task-title">${esc(t.titulo)}</h4>
      <time class="task-date ${dataClass}" datetime="${t.data}">${t.data.toLocaleDateString()}</time>
      <p class="task-economy">Economia: <strong>${formatCurrency(t.economia)}</strong></p>
      <div class="task-footer">
        <span class="task-project">${esc(projNome)}</span>
        <span class="task-avatar" title="Responsável: ${esc(t.responsavel?.getInitials() || 'Não definido')}" aria-label="Responsável: ${esc(t.responsavel?.getInitials())}">${esc(t.responsavel?.getInitials())}</span>
      </div>
      <div class="task-actions">
        <div class="move-dropdown">
          <button class="btn-move" aria-haspopup="true" aria-expanded="false"
            onclick="toggleMoveMenu(event,'menu-${t.id}')" aria-label="Mover tarefa ${esc(t.titulo)}">
            ↕ Mover
          </button>
          <div class="move-menu" id="menu-${t.id}" role="menu" aria-label="Mover para coluna">
            ${outrosCols
              .map(
                (c) => `
              <button role="menuitem" onclick="moveCard('${t.id}','${c.id}')">
                → ${c.label}
              </button>`
              )
              .join('')}
          </div>
        </div>
        <button class="btn-edit" onclick="openEdit('${t.id}')" aria-label="Editar tarefa ${esc(t.titulo)}">✏ Editar</button>
      </div>
    </article>`;
}

function isLate(t) {
  if (t.status === 'finalizado') return false;
  return t.data && new Date(t.data) < new Date();
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toggleMoveMenu(e, menuId) {
  e.stopPropagation();
  const menu = document.getElementById(menuId);
  const btn = e.currentTarget;
  const isOpen = menu.classList.contains('open');

  document
    .querySelectorAll('.move-menu.open')
    .forEach((m) => m.classList.remove('open'));
  document
    .querySelectorAll('.btn-move')
    .forEach((b) => b.setAttribute('aria-expanded', 'false'));

  if (!isOpen) {
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

document.addEventListener('click', () => {
  document
    .querySelectorAll('.move-menu.open')
    .forEach((m) => m.classList.remove('open'));
  document
    .querySelectorAll('.btn-move')
    .forEach((b) => b.setAttribute('aria-expanded', 'false'));
});

async function moveCard(tarefaId, novaColuna) {
  const tarefa = getTarefaById(tarefaId);
  if (!tarefa) return;
  tarefa.status = novaColuna;
  render(s);
  try {
    await tarefasService.update(tarefaId, tarefa);
    const col = COLUNAS.find((c) => c.id === novaColuna);
    showToast(`Movida para ${col.label}`, 'success');
  } catch (error) {
    console.error(error);
    showToast('Erro ao mover tarefa', 'error');
    render();
  }
}

// async function moveCard(tarefaId, novaColuna) {
//   try {
//     const tarefa = getTarefaById(tarefaId);
//     if (!tarefa) return;
//     tarefa.status = novaColuna;
//     await tarefasService.update(tarefaId, tarefa);
//     const col = COLUNAS.find((c) => c.id === novaColuna);
//     showToast(`Movida para ${col.label}`, 'success');
//     render();
//   } catch (error) {
//     console.error(error);
//     showToast('Erro ao mover tarefa', 'error');
//     render();
//   }
// }

function getTarefaById(id) {
  if (s !== undefined) {
    return s.tarefas.find((t) => t.id === id);
  }
}

async function openEdit(tarefaId) {
  const s = await getState();
  const t = s.tarefas.find((x) => x.id === tarefaId);
  if (!t) return;

  document.getElementById('edit-id').value = t.id;
  document.getElementById('edit-titulo').value = t.titulo;
  document.getElementById('edit-data').value = t.data;
  document.getElementById('edit-economia').value = t.economia;
  document.getElementById('edit-responsavel').value = t.responsavel.id;

  const sel = document.getElementById('edit-projeto');
  sel.innerHTML = s.projetos
    .map(
      (p) =>
        `<option value="${p.id}" ${p.id === t.idProjeto ? 'selected' : ''}>${esc(p.descricao)}</option>`
    )
    .join('');

  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.getElementById('edit-titulo').focus();
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
}

function saveEdit() {
  const id = document.getElementById('edit-id').value;
  const titulo = document.getElementById('edit-titulo').value.trim();
  const data = document.getElementById('edit-data').value;
  const econ = parseFloat(document.getElementById('edit-economia').value) || 0;
  const resp = document.getElementById('edit-responsavel').value.trim();
  const projId = document.getElementById('edit-projeto').value;

  if (!titulo) {
    document.getElementById('edit-titulo').focus();
    return;
  }

  setState((s) => {
    const t = s.tarefas.find((x) => x.id === id);
    if (t) {
      t.titulo = titulo;
      t.data = data;
      t.economia = econ;
      t.responsavel = resp;
      t.idProjeto = projId;
    }
  });

  closeModal();
  showToast('Tarefa atualizada!', 'success');
  render();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
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

async function handleDrop(e, colId) {
  e.preventDefault();
  const data = e.dataTransfer.getData('text/plain');
  if (data) {
    console.log(data);
  }
  await moveCard(data, colId);
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  if (!e.currentTarget.contains(e.relatedTarget)) {
    e.currentTarget.classList.remove('drag-over');
  }
}

render();

if (typeof window !== 'undefined') {
  Object.assign(window, {
    render,
    renderCard,
    isLate,
    esc,
    toggleMoveMenu,
    moveCard,
    openEdit,
    closeModal,
    saveEdit,
    showToast,
    toggleMenu,
    minimizeMenu,
    handleDrop,
  });
}

export {
  render,
  renderCard,
  isLate,
  esc,
  toggleMoveMenu,
  moveCard,
  openEdit,
  closeModal,
  saveEdit,
  showToast,
  toggleMenu,
  minimizeMenu,
};
