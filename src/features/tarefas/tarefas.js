/* exported render, renderCard, isLate, esc, toggleMoveMenu, moveCard, openEdit, closeModal, saveEdit, showToast, toggleMenu */

import { comentarioService, tarefasService } from '../../config/container.js';
import {
  getState,
  setState,
  projetosAtivos,
  tarefasAtivas,
  formatCurrency,
  getLocalState,
} from '../../state.js';
import {
  auth,
  deleteUser,
  updateProfile,
  signOut,
} from '../../config/db_config.js';
import { Comentario } from '../../models/Comentario.model.js';
import { Tarefa } from '../../models/Tarefa.model.js';
import { showToast } from '../../utils/toast.js';

const COLUNAS = [
  { id: 'afazer', label: 'A FAZER', cls: 'afazer' },
  { id: 'iniciado', label: 'INICIADO', cls: 'iniciado' },
  { id: 'finalizado', label: 'FINALIZADO', cls: 'finalizado' },
  { id: 'espera', label: 'EM ESPERA', cls: 'espera' },
];

let s;

document.addEventListener('click', () => {
  document
    .querySelectorAll('.move-menu.open')
    .forEach((m) => m.classList.remove('open'));
  document
    .querySelectorAll('.btn-move')
    .forEach((b) => b.setAttribute('aria-expanded', 'false'));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') handleEsc();
});

async function render(state = null) {
  if (state) {
    s = state;
  } else {
    s = await getState();
  }

  document.getElementById('kpi-projetos').textContent =
    projetosAtivos(s).length;
  document.getElementById('kpi-tarefas').textContent = tarefasAtivas(s).length;

  /*Essa parte utiliza o nome do usuário
  para formar o avatar com as iniciais*/
  const user = auth.currentUser;

  if (user) {
    const nome = user.displayName || user.email;
    const iniciais = nome.slice(0, 2).toUpperCase();

    document.getElementById('sb-nome').textContent = nome;
    document.getElementById('sb-avatar').textContent = iniciais;

    document.getElementById('perfil-nome').textContent = nome;
    document.getElementById('perfil-avatar').textContent = iniciais;
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

/* Essa parte faz a alteração do nome dentro do modal do perfil e
salva na variavel novoNome transformando em iniciais, isso tem que
ser passado para o banco para ser utilizado nas outras abas e tarefas*/
window.salvarPerfil = async function () {
  const novoNome = document.getElementById('alterar-perfil-nome').value.trim();

  if (novoNome.length < 4) {
    alert('O nome deve ter pelo menos 4 caracteres.');
    return;
  }

  try {
    await updateProfile(auth.currentUser, {
      displayName: novoNome,
    });

    document.getElementById('sb-nome').textContent = novoNome;

    const iniciais = novoNome.slice(0, 2).toUpperCase();

    document.getElementById('sb-avatar').textContent = iniciais;

    window.fecharPerfil();

    alert('Perfil atualizado com sucesso.');
  } catch (error) {
    console.error(error);
    alert('Erro ao atualizar perfil.');
  }
};

window.abrirPerfil = function () {
  document.getElementById('perfilModal').classList.add('open');
};

window.fecharPerfil = function () {
  document.getElementById('perfilModal').classList.remove('open');
};

window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('perfilModal');

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        window.fecharPerfil();
      }
    });
  }
});

window.logout = async function () {
  try {
    await signOut(auth);

    location.href = '../login/login.html';
  } catch (error) {
    console.error(error);
    alert('Erro ao sair da conta.');
  }
};

// Excluir conta logada
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
  const projNome = proj ? proj.titulo : '—';
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
        <span class="task-avatar" title="Responsável: ${esc(t.responsavel?.getInitials() || 'Não definido')}" 
        aria-label="Responsável: ${esc(t.responsavel?.getInitials())}">${esc(t.responsavel?.getInitials())}</span>

      </div>
        <button class="btn btn-primary btn-details" onclick="openDetailsModal('${t.id}')">Detalhes</button>
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
  document.getElementById('edit-data').value = t.data
    .toISOString()
    .split('T')[0];
  document.getElementById('edit-economia').value = t.economia;
  document.getElementById('edit-descricao').value = t.descricao;

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
  modalEditTask.onclick = (e) => {
    if (e.target === e.currentTarget) closeModalEditTask();
  };
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
  modalDeleteTask.onclick = (e) => {
    if (e.target === e.currentTarget) closeModalDeleteTask();
  };
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
  } finally {
    closeModalDeleteTask();
  }
}

async function saveEdit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  const titulo = formData.get('titulo').trim();
  const data = new Date(formData.get('data') + 'T00:00');
  const economia = parseFloat(formData.get('economia')) || 0;
  const idResponsavel = formData.get('idResponsavel').trim();
  const descricao = formData.get('descricao').trim();
  const idProjeto = formData.get('idProjeto').trim();
  const id = formData.get('id');

  let tarefa;

  try {
    const state = setState((s) => {
      tarefa = s.tarefas.find((x) => x.id === id);
      if (tarefa) {
        tarefa.titulo = titulo;
        tarefa.data = data;
        tarefa.economia = economia;
        tarefa.idResponsavel = idResponsavel;
        tarefa.idProjeto = idProjeto;
        tarefa.descricao = descricao;
      } else {
        throw new Error('Tarefa não encontrada no estado');
      }
    });

    render(state);

    await tarefasService.update(id, tarefa);
    showToast(`Tarefa atualizada com sucesso`, 'success');
  } catch (error) {
    console.error(error);
    showToast('Erro ao atualizar tarefa', 'error');
    render();
  } finally {
    closeModalEditTask();
  }
}

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
  modalCreateTask.onclick = (e) => {
    if (e.target === e.currentTarget) closeModalCreateTask();
  };
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
  const descricao = formData.get('descricao').trim();
  const idProjeto = formData.get('idProjeto').trim();
  const user = auth.currentUser;
  const tarefa = new Tarefa({
    titulo,
    data,
    economia,
    idResponsavel,
    idProjeto,
    descricao,
    idCriador: user ? user.uid : 'unknown',
  });

  try {
    await tarefasService.create(tarefa);
    showToast(`Tarefa criada com sucesso`, 'success');
  } catch (error) {
    console.error(error);
    showToast('Erro ao criar tarefa', 'error');
    render();
  } finally {
    closeModalCreateTask();
  }
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

function openDetailsModal(tarefaId) {
  const s = getLocalState();
  const t = s.tarefas.find((x) => x.id === tarefaId);
  if (!t) return;
  const criador = s.usuarios.find((u) => u.id === t.idCriador);

  document.getElementById('comentario-form').onsubmit = (event) =>
    addComentario(event, t.id);

  const projeto = s.projetos.find((p) => p.id === t.idProjeto);
  const responsavel = s.usuarios.find((u) => u.id === t.idResponsavel);

  const modal = document.getElementById('modal-details-task');

  document.getElementById('details-titulo').textContent = t.titulo;

  document.getElementById('details-descricao').textContent = t.descricao;

  document.getElementById('details-projeto').textContent =
    `${projeto ? projeto.titulo : '—'}`;

  document.getElementById('details-responsavel').textContent =
    `${responsavel ? `${responsavel.nome} ${responsavel.sobrenome}` : '—'}`;

  document.getElementById('details-status').textContent =
    `${t.status.toUpperCase()}`;

  document.getElementById('details-criador').textContent =
    `${[criador?.nome, criador?.sobrenome].join(' ') || '—'}`;

  document.getElementById('details-data').textContent =
    `${t.data.toLocaleDateString('pt-BR')}`;

  document.getElementById('details-economia').textContent =
    `${formatCurrency(t.economia)}`;

  modal.onclick = (e) => {
    if (e.target === e.currentTarget) modal.classList.remove('open');
  };

  modal.classList.add('open');

  renderComments(t);
}

function renderComments(tarefa) {
  tarefa.comentarios.sort(
    (a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao)
  );

  const container = document.getElementById('comentarios-list');
  const state = getLocalState() || { usuarios: [] };

  container.innerHTML = tarefa.comentarios
    .map((c) => {
      const autor =
        c.autor ||
        state.usuarios.find((u) => u.id === c.idUsuario)?.nome ||
        'Desconhecido';

      return `
      <div class="comentario">
        <button class="btn-delete-comentario" onclick="deleteComentario('${c.id}', '${tarefa.id}')">×</button>

        <p class="comentario-autor">${autor}</p>
        <p class="comentario-detalhe">
          ${c.detalhe}
        </p>
        <div class="comentario-footer">
          <p class="comentario-data">${new Date(c.dataCriacao).toLocaleString('pt-BR')}</p>
        </div>
      </div>
      `;
    })
    .join('');
}

async function addComentario(e, id) {
  try {
    e.preventDefault();
    const detalhe = document.getElementById('comentario-input').value.trim();

    let tarefa;
    let comentario;

    setState((s) => {
      tarefa = s.tarefas.find((t) => t.id === id);
      if (tarefa) {
        const user = auth.currentUser;
        comentario = new Comentario({
          id: `c${Date.now()}`,
          idUsuario: user ? user.uid : 'unknown',
          detalhe,
          dataCriacao: new Date(),
        });
        comentario.autor = user
          ? `${user.displayName || user.email}`
          : 'Desconhecido';
        tarefa.comentarios.push(comentario);
      } else {
        throw new Error('Tarefa não encontrada no estado');
      }
    });

    const comentarioId = await comentarioService.create(tarefa.id, comentario);
    comentario.id = comentarioId;
    renderComments(tarefa);
    document.getElementById('comentario-input').value = '';
  } catch (error) {
    console.error(error);
    showToast('Erro ao comentar', 'error');
    const tarefa = await tarefasService.getById(id);
    renderComments(tarefa);
  }
}

async function deleteComentario(comentarioId, tarefaId) {
  let tarefa;
  setState((s) => {
    s.tarefas.forEach((t) => {
      if (t.id === tarefaId) {
        tarefa = t;
        t.comentarios = t.comentarios.filter((c) => c.id !== comentarioId);
      }
    });
  });

  renderComments(tarefa);
  try {
    await comentarioService.delete(tarefaId, comentarioId);
    await tarefasService.getById(tarefaId);
    showToast('Comentário excluído', 'success');
  } catch (error) {
    console.error(error);
    showToast('Erro ao excluir comentário', 'error');
    const tarefa = await tarefasService.getById(tarefaId);
    renderComments(tarefa);
  }
}

function filtrarTarefa() {
  const filtro = document.getElementById('filtro-busca').value.toLowerCase();

  const state = getLocalState();

  const tarefasFiltradas = state.tarefas.filter((t) => {
    const projeto = state.projetos.find((p) => p.id === t.idProjeto);
    const responsavel = state.usuarios.find((u) => u.id === t.idResponsavel);
    return (
      t.titulo.toLowerCase().includes(filtro) ||
      (projeto && projeto.titulo.toLowerCase().includes(filtro)) ||
      (responsavel &&
        `${responsavel.nome} ${responsavel.sobrenome}`
          .toLowerCase()
          .includes(filtro))
    );
  });

  render({ ...state, tarefas: tarefasFiltradas });
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
    deleteComentario,
    closeModalDeleteTask,
    saveEdit,
    toggleMenu,
    minimizeMenu,
    handleDrop,
    deleteAccount,
    filtrarTarefa,
    openDetailsModal,
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
