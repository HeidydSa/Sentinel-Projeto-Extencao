import { getState } from '../../state.js';
import {
  auth,
  requireSession,
  refreshSession,
  signOut,
  updateProfile,
  deleteUser,
} from '../../config/session.js';
import { dashboardData, renderDashboard } from './dashboard.js';
import { showToast } from '../../utils/toast.js';

let state;
let quarter = 'all';
let projectId = '';
let top = 5;
const yearInput = document.getElementById('stats-year');
const feedback = document.getElementById('stats-feedback');
const dashboard = document.getElementById('stats-dashboard');
function draw() {
  if (!state) return;
  const year = Number(yearInput.value);
  const data = dashboardData(state, { quarter, year });
  if (!data.projects.some((p) => p.id === projectId)) projectId = '';
  dashboard.innerHTML = renderDashboard(data, { projectId, top, year });
  dashboard.hidden = false;
  feedback.textContent =
    quarter === 'all'
      ? 'Dados atuais do servidor. Todos os períodos.'
      : 'Tarefas filtradas pelo prazo; projetos criados no período ou vinculados às tarefas.';
  document.getElementById('stats-project').onchange = (e) => {
    projectId = e.target.value;
    draw();
  };
  document.getElementById('stats-top').onchange = (e) => {
    top = Number(e.target.value);
    draw();
  };
}
async function render() {
  const button = document.getElementById('stats-refresh');
  button.disabled = true;
  feedback.textContent = 'Carregando dados do servidor…';
  try {
    await refreshSession();
    state = await getState();
    const previous = yearInput.value;
    const years = [
      ...new Set(
        [
          new Date().getFullYear(),
          ...state.tarefas.map((t) => t.data?.getFullYear()),
          ...state.projetos.map((p) => p.createdAt?.getFullYear()),
        ].filter(Number.isFinite)
      ),
    ].sort((a, b) => b - a);
    yearInput.replaceChildren(
      ...years.map((y) => new Option(String(y), String(y)))
    );
    if (years.includes(Number(previous))) yearInput.value = previous;
    renderUser();
    draw();
  } catch (error) {
    dashboard.hidden = true;
    feedback.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}
function renderUser() {
  const user = auth.currentUser;
  if (!user) return;
  for (const id of ['sb-nome', 'perfil-nome'])
    document.getElementById(id).textContent = user.displayName;
  for (const id of ['sb-avatar', 'perfil-avatar'])
    document.getElementById(id).textContent = user.displayName
      .slice(0, 2)
      .toUpperCase();
  document.getElementById('alterar-perfil-nome').value = user.displayName;
  const isAdmin = state?.funcoes.some(
    (role) =>
      String(role.id) === String(user.funcaoId) && /admin/i.test(role.tipo)
  );
  document.getElementById('btnCadastro').style.display = isAdmin
    ? 'block'
    : 'none';
}
document.querySelectorAll('[data-quarter]').forEach((button) => {
  button.onclick = () => {
    quarter = button.dataset.quarter;
    document.querySelectorAll('[data-quarter]').forEach((b) => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    draw();
  };
});
yearInput.onchange = draw;
document.getElementById('stats-refresh').onclick = render;
window.toggleMenu = (button) => {
  document.getElementById('sidebar').classList.toggle('sidebar--open');
  button.setAttribute(
    'aria-expanded',
    String(
      document.getElementById('sidebar').classList.contains('sidebar--open')
    )
  );
};
window.minimizeMenu = () =>
  document.getElementById('sidebar').classList.toggle('minimized');
window.abrirPerfil = () => {
  renderUser();
  document.getElementById('perfilModal').classList.add('open');
};
window.fecharPerfil = () =>
  document.getElementById('perfilModal').classList.remove('open');
window.salvarPerfil = async () => {
  try {
    const name = document.getElementById('alterar-perfil-nome').value.trim();
    if (name.length < 4)
      throw new Error('O nome deve ter pelo menos 4 caracteres.');
    await updateProfile(auth.currentUser, { displayName: name });
    renderUser();
    window.fecharPerfil();
  } catch (error) {
    showToast(error.message, 'error');
  }
};
window.logout = async () => {
  await signOut();
  location.href = '../../index.html';
};
window.deleteAccount = async () => {
  if (!confirm('Excluir sua conta permanentemente?')) return;
  try {
    await deleteUser(auth.currentUser);
    location.href = '../login/login.html';
  } catch (error) {
    showToast(error.message, 'error');
  }
};
document.getElementById('perfilModal').onclick = (e) => {
  if (e.target === e.currentTarget) window.fecharPerfil();
};
if (requireSession()) render();
