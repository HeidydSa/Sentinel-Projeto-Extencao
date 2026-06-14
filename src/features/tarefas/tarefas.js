/* exported render, renderCard, isLate, esc, toggleMoveMenu, moveCard, openEdit, closeModal, saveEdit, showToast, toggleMenu */

import { tarefasService } from '../../config/container.js';
import {
  getState,
  setState,
  projetosAtivos,
  tarefasAtivas,
  formatCurrency,
  getLocalState,
} from '../../state.js';
import { auth, deleteUser } from '../../config/db_config.js';
import { Tarefa } from '../../models/Tarefa.model.js';

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

  //document.getElementById('sb-avatar').textContent = s.usuario.iniciais;
  //document.getElementById('sb-nome').textContent = s.usuario.nome;

  const user = auth.currentUser;

  if (user) {
    const nome = user.displayName || user.email;

    document.getElementById('sb-nome').textContent = nome;

    const iniciais = nome.slice(0, 2).toUpperCase();

    document.getElementById('sb-avatar').textContent = iniciais;
  }

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
      <time class="task-date ${dataClass}" datetime="${t.data}">${t.data.toLocaleDateString('pt-BR')}</time>
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
        <button class="btn-delete" onclick="openDeleteTask('${t.id}')" aria-label="Remover tarefa ${esc(t.titulo)}">🗑 Remover</button>
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
  try {
    let tarefa = null;
    const state = setState((s) => {
      tarefa = s.tarefas.find((t) => t.id === tarefaId);
      if (tarefa) {
        tarefa.status = novaColuna;
      } else {
        throw new Error('Tarefa não encontrada no estado');
      }
    });

    render(state);
    await tarefasService.update(tarefaId, tarefa);
    const col = COLUNAS.find((c) => c.id === novaColuna);
    showToast(`Movida para ${col.label}`, 'success');
  } catch (error) {
    console.error(error);
    showToast('Erro ao mover tarefa', 'error');
    render();
  }
}

async function openEdit(tarefaId) {
  const s = getLocalState();
  const t = s.tarefas.find((x) => x.id === tarefaId);
  if (!t) return;

  document.getElementById('edit-id').value = t.id;
  document.getElementById('edit-titulo').value = t.titulo;
  document.getElementById('edit-data').value = t.data;
  document.getElementById('edit-economia').value = t.economia;

  const sel = document.getElementById('edit-projeto');
  sel.innerHTML = s.projetos
    .map(
      (p) =>
        `<option value="${p.id}" ${p.id === t.idProjeto ? 'selected' : ''}>${esc(p.descricao)}</option>`
    )
    .join('');
  const responsavelSelect = document.getElementById('edit-responsavel');
  responsavelSelect.innerHTML = s.usuarios
    .map(
      (u) =>
        `<option value="${u.id}" ${u.id === t.idResponsavel ? 'selected' : ''}>${u.nome} ${u.sobrenome}</option>`
    )
    .join('');
  const modalEditTask = document.getElementById('modal-edit-task');
  modalEditTask.classList.add('open');
  modalEditTask.setAttribute('aria-hidden', 'false');
  document.getElementById('edit-titulo').focus();
}

function closeModalEditTask() {
  const modalEditTask = document.getElementById('modal-edit-task');
  modalEditTask.classList.remove('open');
  modalEditTask.setAttribute('aria-hidden', 'true');
}

function openDeleteTask(tarefaId) {
  const modalDeleteTask = document.getElementById('modal-delete-task');
  modalDeleteTask.classList.add('open');
  modalDeleteTask.setAttribute('aria-hidden', 'false');

  const confirmBtn = document.getElementById('confirm-delete-btn');
  const closeDeleteBtn = document.getElementById('close-delete-btn');

  confirmBtn.onclick = async () => {
    confirmBtn.textContent = 'Excluindo...';
    confirmBtn.disabled = true;
    closeDeleteBtn.disabled = true;
    await deleteTask(tarefaId);
    confirmBtn.disabled = false;
    closeDeleteBtn.disabled = false;
    closeModalDeleteTask();
  };
}

function closeModalDeleteTask() {
  const modal = document.getElementById('modal-delete-task');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

async function deleteTask(tarefaId) {
  try {
    await tarefasService.delete(tarefaId);

    await render();
    showToast('Tarefa excluída com sucesso', 'success');
  } catch (error) {
    console.error(error);
    showToast('Erro ao excluir tarefa', 'error');
  }
}

async function saveEdit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  const titulo = formData.get('titulo').trim();
  const data = new Date(formData.get('data') + 'T00:00');
  const economia = parseFloat(formData.get('economia')) || 0;
  const idResponsavel = formData.get('idResponsavel').trim();
  const idProjeto = formData.get('idProjeto').trim();
  const id = formData.get('id');

  try {
    const state = setState((s) => {
      const t = s.tarefas.find((x) => x.id === id);
      if (t) {
        t.titulo = titulo;
        t.data = data;
        t.economia = economia;
        t.responsavel = idResponsavel;
        t.idProjeto = idProjeto;
      } else {
        throw new Error('Tarefa não encontrada no estado');
      }
    });

    render(state);

    await tarefasService.update(id, {
      titulo,
      data,
      economia,
      idResponsavel,
      idProjeto,
    });
    showToast(`Tarefa atualizada com sucesso`, 'success');
  } catch (error) {
    console.error(error);
    showToast('Erro ao atualizar tarefa', 'error');
    render();
  }

  closeModalEditTask();
  showToast('Tarefa atualizada!', 'success');
  render();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') handleEsc();
});

function handleEsc() {
  if (document.getElementById('modal-edit-task').classList.contains('open')) {
    closeModalEditTask();
  }
  if (document.getElementById('modal-create-task').classList.contains('open')) {
    closeModalCreateTask();
  }
  if (document.getElementById('modal-delete-task').classList.contains('open')) {
    closeModalDeleteTask();
  }
  closeModalEditTask();
  closeModalCreateTask();
  closeModalDeleteTask();
}

document.getElementById('modal-edit-task').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModalEditTask();
});

async function openCreateTask() {
  const projetoSelect = document.getElementById('create-projeto');
  projetoSelect.innerHTML = [
    '<option selected disabled></option>',
    ...s.projetos.map(
      (p) => `<option value="${p.id}">${esc(p.descricao)}</option>`
    ),
  ].join('');

  const responsavelSelect = document.getElementById('create-responsavel');
  responsavelSelect.innerHTML = [
    '<option selected disabled></option>',
    ...s.usuarios.map(
      (u) => `<option value="${u.id}">${u.nome} ${u.sobrenome}</option>`
    ),
  ].join('');

  const modalCreateTask = document.getElementById('modal-create-task');
  modalCreateTask.classList.add('open');
  modalCreateTask.setAttribute('aria-hidden', 'false');
  document.getElementById('create-titulo').focus();
}

function closeModalCreateTask() {
  const modalCreateTask = document.getElementById('modal-create-task');
  modalCreateTask.classList.remove('open');
  modalCreateTask.setAttribute('aria-hidden', 'true');
}

async function saveCreateTask(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  const titulo = formData.get('titulo').trim();
  const data = new Date(formData.get('data') + 'T00:00');
  const economia = parseFloat(formData.get('economia')) || 0;
  const idResponsavel = formData.get('idResponsavel').trim();
  const idProjeto = formData.get('idProjeto').trim();
  const user = auth.currentUser;
  const tarefa = new Tarefa({
    titulo,
    data,
    economia,
    idResponsavel,
    idProjeto,
    idCriador: user ? user.uid : 'unknown',
  });

  const state = getState((s) => {
    s.tarefas.push(tarefa);
  });

  render(state);
  try {
    await tarefasService.create(tarefa);
    showToast(`Tarefa criada com sucesso`, 'success');
  } catch (error) {
    console.error(error);
    showToast('Erro ao criar tarefa', 'error');
    render();
  }

  closeModalCreateTask();
  showToast('Tarefa criada!', 'success');
  render();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModalCreateTask();
});

function showToast(msg, type = '') {
  const toastContainer = document.getElementById('toast-container');

  const newToast = document.createElement('div');
  newToast.className = 'toast' + (type ? ' ' + type : '');
  newToast.textContent = msg;
  newToast.ariaRoleDescription = 'status';
  newToast.ariaLive = 'polite';

  toastContainer.appendChild(newToast);

  setTimeout(() => {
    newToast.classList.add('show');
  }, 100);

  setTimeout(() => {
    newToast.classList.remove('show');
    setTimeout(() => toastContainer.removeChild(newToast), 300);
  }, 2500);
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
    openCreateTask,
    closeModalEditTask,
    closeModalCreateTask,
    saveCreateTask,
    openDeleteTask,
    closeModalDeleteTask,
    saveEdit,
    showToast,
    toggleMenu,
    minimizeMenu,
    handleDrop,
    deleteAccount,
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
  openCreateTask,
  closeModalEditTask,
  saveEdit,
  showToast,
  toggleMenu,
  minimizeMenu,
  closeModalCreateTask,
  saveCreateTask,
};
