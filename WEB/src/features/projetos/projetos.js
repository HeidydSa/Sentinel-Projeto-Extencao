/* exported render, esc, toggleMenu */

import { projetosService, usuariosService } from '../../config/container.js';
import {
  getState,
  setState,
  projetosAtivos,
  economiaPorProjeto,
  formatCurrency,
  getLocalState,
} from '../../state.js';
import { auth, googleProvider } from '../../config/db_config.js';
import {
  deleteUser,
  updateProfile,
  signOut,
  onAuthStateChanged,
  linkWithPopup,
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';
import { EnumStatusProjeto } from '../../utils/enums.js';
import { Projeto } from '../../models/Projeto.model.js';
import { showToast } from '../tarefas/tarefas.js';

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') handleEsc();
});

async function render(s) {
  let state;
  if (s) {
    state = s;
  } else {
    state = await getState();
  }

  const grid = document.getElementById('projetos-grid');
  const ativos = projetosAtivos(state);

  const user = auth.currentUser;

  if (user) {
    const nome = user.displayName || user.email;
    const iniciais = nome.slice(0, 2).toUpperCase();

    document.getElementById('sb-nome').textContent = nome;
    document.getElementById('sb-avatar').textContent = iniciais;

    document.getElementById('perfil-nome').textContent = nome;
    document.getElementById('perfil-avatar').textContent = iniciais;
  }

  if (ativos.length === 0) {
    grid.innerHTML = '<p class="empty-state">Nenhum projeto ativo.</p>';
    return;
  }

  grid.innerHTML = ativos
    .map((p) => {
      const econ = economiaPorProjeto(state, p.id);
      const tarefas = state.tarefas.filter(
        (t) => t.idProjeto === p.id && t.status !== EnumStatusProjeto.FINALIZADO
      ).length;
      const badgeCls = EnumStatusProjeto.getCSSClass(p.status);
      const badgeTxt = EnumStatusProjeto.getLabel(p.status);
      return `
      <article class="projeto-card" role="listitem" tabindex="0" aria-labelledby="p-${p.id}">
        <h3 id="p-${p.id}" class="projeto-nome">${esc(p.titulo)}</h3>
        <dl class="projeto-info">
          <div><dt>Status</dt><dd><span class="status-badge ${badgeCls}">${badgeTxt}</span></dd></div>
          <div><dt>Economia total</dt><dd>${formatCurrency(econ)}</dd></div>
          <div><dt>Tarefas ativas</dt><dd>${tarefas}</dd></div>
        </dl>
        <button class="btn btn-primary btn-details" onclick="openDetailsModal('${p.id}')">Detalhes</button>
        <div class="projeto-actions">
          <button class="btn-edit" onclick="openEditModal('${p.id}')" aria-label="Editar projeto ${esc(p.descricao)}">✏ Editar</button>
          <button class="btn-delete" onclick="openDeleteModal('${p.id}')" aria-label="Remover projeto ${esc(p.descricao)}">🗑 Remover</button>
        </div>
      </article>`;
    })
    .join('');
}

function openDetailsModal(projectId) {
  const modalDetails = document.getElementById('modal-details-project');
  modalDetails.onclick = (e) => {
    if (e.target === e.currentTarget) closeDetailsModal();
  };
  const s = getLocalState();
  const p = s.projetos.find((x) => x.id === projectId);
  if (!p) return;

  const badgeCls = EnumStatusProjeto.getCSSClass(p.status);
  const badgeTxt = EnumStatusProjeto.getLabel(p.status);

  const dataEntrega = p.dataEntrega
    ? new Date(p.dataEntrega).toLocaleDateString()
    : 'Sem data de entrega';

  document.getElementById('details-titulo').textContent = p.titulo;
  document.getElementById('details-descricao').textContent = p.descricao;
  const statusEl = document.getElementById('details-status');
  statusEl.className = `status-badge ${badgeCls}`;
  statusEl.textContent = badgeTxt;

  document.getElementById('details-economia').textContent = formatCurrency(
    economiaPorProjeto(s, p.id)
  );
  document.getElementById('details-data').textContent = `${dataEntrega}`;
  document.getElementById('details-tarefas_ativas').textContent = `${
    s.tarefas.filter((t) => t.idProjeto === p.id && t.status !== 'finalizado')
      .length
  }`;

  modalDetails.classList.add('open');
  modalDetails.setAttribute('aria-hidden', 'false');
}

function closeDetailsModal() {
  const modalDetails = document.getElementById('modal-details-project');
  modalDetails.classList.remove('open');
  modalDetails.setAttribute('aria-hidden', 'true');
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

    location.href = '../../index.html';
  } catch (error) {
    console.error(error);
    alert('Erro ao sair da conta.');
  }
};

// Exibição do botao cadastro
onAuthStateChanged(auth, async (user) => {
  const btn = document.getElementById('btnCadastro');
  if (!btn) return;

  // sempre começa escondido
  btn.style.display = 'none';

  if (!user) return;

  try {
    const usuarios = await usuariosService.getAll();
    const usuario = usuarios.find((u) => u.email === user.email);

    const isAdmin = usuario && usuario.funcaoId === 'admin';

    btn.style.display = isAdmin ? 'block' : 'none';
  } catch (e) {
    console.error(e);
    btn.style.display = 'none';
  }
});

//Vincular conta Google
async function vincularGoogle() {
  try {
    await linkWithPopup(auth.currentUser, googleProvider);

    alert('Conta Google vinculada com sucesso.');
  } catch (erro) {
    if (erro.code === 'auth/provider-already-linked') {
      alert('Google já vinculado.');
      return;
    }

    alert(erro.message);
  }
}

window.vincularGoogle = vincularGoogle;

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

function openCreateModal() {
  const statusSelect = document.getElementById('create-status');
  const statuses = [
    EnumStatusProjeto.NAO_INICIADO,
    EnumStatusProjeto.EM_PRODUCAO,
    EnumStatusProjeto.FINALIZADO,
  ];
  statusSelect.innerHTML = statuses
    .map(
      (p) =>
        `<option value="${p}" ${p === p.status ? 'selected' : ''}>${EnumStatusProjeto.getLabel(p)}</option>`
    )
    .join('');

  const modalCreateTask = document.getElementById('modal-create-project');
  modalCreateTask.onclick = (e) => {
    if (e.target === e.currentTarget) closeCreateModal();
  };
  modalCreateTask.classList.add('open');
  modalCreateTask.setAttribute('aria-hidden', 'false');
  document.getElementById('create-titulo').focus();
}

function closeCreateModal() {
  const modalCreateTask = document.getElementById('modal-create-project');
  modalCreateTask.classList.remove('open');
  modalCreateTask.setAttribute('aria-hidden', 'true');
}

function openEditModal(projectId) {
  const s = getLocalState();
  const p = s.projetos.find((x) => x.id === projectId);
  if (!p) return;

  document.getElementById('edit-id').value = p.id;
  document.getElementById('edit-titulo').value = p.titulo;
  document.getElementById('edit-descricao').value = p.descricao;

  const statusSelect = document.getElementById('edit-status');
  const statuses = [
    EnumStatusProjeto.NAO_INICIADO,
    EnumStatusProjeto.EM_PRODUCAO,
    EnumStatusProjeto.FINALIZADO,
  ];
  statusSelect.innerHTML = statuses
    .map(
      (status) =>
        `<option value="${status}" ${status === p.status ? 'selected' : ''}>${EnumStatusProjeto.getLabel(status)}</option>`
    )
    .join('');

  const modalEditTask = document.getElementById('modal-edit-project');
  modalEditTask.onclick = (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  };
  modalEditTask.classList.add('open');
  modalEditTask.setAttribute('aria-hidden', 'false');
  document.getElementById('edit-titulo').focus();
}

function closeEditModal() {
  const modalEditTask = document.getElementById('modal-edit-project');
  modalEditTask.classList.remove('open');
  modalEditTask.setAttribute('aria-hidden', 'true');
}

function openDeleteModal(id) {
  const modalDeleteTask = document.getElementById('modal-delete-project');
  modalDeleteTask.onclick = (e) => {
    if (e.target === e.currentTarget) closeDeleteModal();
  };
  modalDeleteTask.classList.add('open');
  modalDeleteTask.setAttribute('aria-hidden', 'false');

  const confirmBtn = document.getElementById('confirm-delete-btn');
  const closeDeleteBtn = document.getElementById('close-delete-btn');

  confirmBtn.onclick = async () => {
    confirmBtn.textContent = 'Excluindo...';
    confirmBtn.disabled = true;
    closeDeleteBtn.disabled = true;
    await onDelete(id);
    confirmBtn.disabled = false;
    closeDeleteBtn.disabled = false;
  };
}

function closeDeleteModal() {
  const modal = document.getElementById('modal-delete-project');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

async function onUpdate(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  const id = formData.get('id');
  const titulo = formData.get('titulo').trim();
  const descricao = formData.get('descricao').trim();
  const status = formData.get('status');

  const projeto = new Projeto({ id, titulo, descricao, status });

  try {
    const state = setState((s) => {
      const p = s.projetos.find((x) => x.id === id);
      if (p) {
        p.titulo = projeto.titulo;
        p.descricao = projeto.descricao;
        p.status = projeto.status;
      } else {
        throw new Error('Projeto não encontrado no estado');
      }
    });

    render(state);

    await projetosService.update(id, projeto);
    showToast(`Projeto atualizado com sucesso`, 'success');
  } catch (error) {
    console.error(error);
    showToast('Erro ao atualizar projeto', 'error');
    render();
  } finally {
    closeEditModal();
  }
}

async function onDelete(projetoId) {
  try {
    await projetosService.delete(projetoId);
    await render();
    showToast('Projeto excluído com sucesso', 'success');
  } catch (error) {
    console.error(error);
    showToast('Erro ao excluir projeto', 'error');
  } finally {
    closeDeleteModal();
  }
}

async function onCreate(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  const titulo = formData.get('titulo').trim();
  const descricao = formData.get('descricao').trim();
  const status = formData.get('status');

  const projeto = new Projeto({ titulo, descricao, status });

  try {
    await projetosService.create(projeto);
    showToast(`Projeto criado com sucesso`, 'success');
    render();
  } catch (error) {
    console.error(error);
    showToast('Erro ao criar projeto', 'error');
    render();
  } finally {
    closeCreateModal();
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

function filtrarProjeto() {
  const filtro = document.getElementById('filtro-busca').value.toLowerCase();

  const state = getLocalState();

  const projetosFiltrados = state.projetos.filter((p) => {
    return (
      p.titulo.toLowerCase().includes(filtro) ||
      p.descricao.toLowerCase().includes(filtro)
    );
  });

  render({ ...state, projetos: projetosFiltrados });
}

function handleEsc() {
  if (
    document.getElementById('modal-edit-project').classList.contains('open')
  ) {
    closeEditModal();
  }
  if (
    document.getElementById('modal-create-project').classList.contains('open')
  ) {
    closeCreateModal();
  }
  if (
    document.getElementById('modal-delete-project').classList.contains('open')
  ) {
    closeDeleteModal();
  }
  if (
    document.getElementById('modal-details-project').classList.contains('open')
  ) {
    closeDetailsModal();
  }
}

render();

if (typeof window !== 'undefined') {
  Object.assign(window, {
    render,
    esc,
    toggleMenu,
    minimizeMenu,
    openDetailsModal,
    closeDetailsModal,
    openCreateModal,
    closeCreateModal,
    openDeleteModal,
    closeDeleteModal,
    openEditModal,
    closeEditModal,
    filtrarProjeto,
    onCreate,
    onUpdate,
    onDelete,
    deleteAccount,
  });
}

export { render, esc, toggleMenu, minimizeMenu };
