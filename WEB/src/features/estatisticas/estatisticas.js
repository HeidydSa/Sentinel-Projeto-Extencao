import { getState } from '../../state.js';
import {
  auth,
  requireSession,
  refreshSession,
  signOut,
  updateProfile,
  deleteUser,
} from '../../services/auth_service.js';

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
    (role) => String(role.id) === String(user.funcaoId) && Number(role.id) === 1
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
const colors = ['#983bff', '#e85691', '#ffd35c', '#a2a2bb'];
const money = (value) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]
  );

export function taskStatus(task, now = new Date()) {
  if (task.status === 'finalizado') return 0;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (task.data && new Date(task.data) < today) return 2;
  if (task.status === 'iniciado') return 1;
  return 3;
}
export function dashboardData(
  state,
  { quarter = 'all', year = new Date().getFullYear(), now = new Date() } = {}
) {
  const inside = (value) => {
    if (quarter === 'all') return true;
    if (!value) return false;
    const date = new Date(value);
    return (
      date.getFullYear() === Number(year) &&
      Math.floor(date.getMonth() / 3) === Number(quarter)
    );
  };
  const tasks = state.tarefas.filter((t) => inside(t.data));
  const projects = state.projetos.filter(
    (p) => inside(p.createdAt) || tasks.some((t) => t.idProjeto === p.id)
  );
  const taskCounts = [0, 0, 0, 0];
  tasks.forEach((t) => taskCounts[taskStatus(t, now)]++);
  const projectCounts = [
    projects.filter((p) => p.status === 'em_producao' || p.status === 'ativo')
      .length,
    projects.filter((p) => p.status === 'finalizado').length,
    projects.filter(
      (p) =>
        p.status !== 'finalizado' &&
        p.status !== 'em_producao' &&
        p.status !== 'ativo'
    ).length,
  ];
  const savings = projects.map((p) => ({
    ...p,
    total: tasks
      .filter((t) => t.idProjeto === p.id)
      .reduce((sum, t) => sum + Number(t.economia || 0), 0),
    tasks: tasks.filter((t) => t.idProjeto === p.id),
  }));
  const months = Array(12).fill(0);
  tasks.forEach((t) => {
    if (t.data && new Date(t.data).getFullYear() === Number(year))
      months[new Date(t.data).getMonth()] += Number(t.economia || 0);
  });
  return {
    projects,
    tasks,
    taskCounts,
    projectCounts,
    savings,
    months,
    total: tasks.reduce((sum, t) => sum + Number(t.economia || 0), 0),
  };
}
function donut(title, labels, counts, palette = colors) {
  const total = counts.reduce((a, b) => a + b, 0);
  let offset = 0;
  const gradient = counts
    .map((n, i) => {
      const start = offset;
      offset += total ? (n / total) * 100 : 0;
      return `${palette[i]} ${start}% ${offset}%`;
    })
    .join(',');
  return `<div class="donut-container"><div class="donut" role="img" aria-label="${escape(labels.map((l, i) => l + ': ' + counts[i]).join('; '))}" style="background:${total ? 'conic-gradient(' + gradient + ')' : '#e8e8ec'}"><div class="donut-centro"><strong>${total}</strong><span>${title}</span></div></div><div class="stats-legenda">${labels.map((label, i) => `<span><i class="cor" style="background:${palette[i]}"></i>${label}<b>${counts[i]}</b><small>${total ? ((counts[i] / total) * 100).toFixed(1).replace('.', ',') : '0'}%</small></span>`).join('')}</div></div>`;
}
export function renderDashboard(
  data,
  { projectId = '', top = 5, year, now = new Date() } = {}
) {
  const tasksLabels = [
    'Concluídas',
    'Em andamento',
    'Atrasadas',
    'Não iniciadas / em espera',
  ];
  const selected = data.savings.filter((p) => !projectId || p.id === projectId);
  const max = Math.max(1, ...selected.map((p) => p.total));
  const ranking = [...data.savings]
    .sort((a, b) => b.total - a.total)
    .slice(0, Number(top));
  const maxRank = Math.max(1, ...ranking.map((p) => p.total));
  const maxTasks = Math.max(1, ...data.savings.map((p) => p.tasks.length));
  const monthMax = Math.max(1, ...data.months);
  const points = data.months
    .map((v, i) => `${8 + (i * 384) / 11},${138 - (v / monthMax) * 120}`)
    .join(' ');
  const panel = (title, body, control = '') =>
    `<article class="stats-panel"><div class="stats-panel-header"><h2>${title}</h2>${control}</div>${body}</article>`;
  const kpis = [
    [
      'PROJETOS ATIVOS',
      data.projects.filter((p) => p.status !== 'finalizado').length,
    ],
    ['PROJETOS FINALIZADOS', data.projectCounts[1]],
    ['TAREFAS TOTAIS', data.tasks.length],
    ['TAREFAS CONCLUÍDAS', data.taskCounts[0]],
    [
      'TAREFAS EM ANDAMENTO',
      data.tasks.filter((t) => t.status === 'iniciado').length,
    ],
    ['ECONOMIA TOTAL', money(data.total)],
  ];
  const bars = selected.length
    ? `<div class="grafico-economia">${selected.map((p, i) => `<div class="grafico-barra"><span>${money(p.total)}</span><div style="height:${(p.total / max) * 75}%;background:${colors[i % colors.length]}"></div><small>${escape(p.titulo)}</small></div>`).join('')}</div>`
    : '<p class="empty-state">Nenhum projeto neste período.</p>';
  return `<section class="stats-kpis" aria-label="Indicadores">${kpis.map(([label, value]) => `<article class="stats-card"><span>${label}</span><strong>${value}</strong><small>Período selecionado</small></article>`).join('')}</section>
    <section class="stats-grid-linha1">
      <article class="stats-panel economia-panel"><div class="stats-panel-header"><h2>Economia por projeto</h2><label class="sr-only" for="stats-project">Projeto</label><select id="stats-project"><option value="">Todos os projetos</option>${data.projects.map((p) => `<option value="${escape(p.id)}" ${p.id === projectId ? 'selected' : ''}>${escape(p.titulo)}</option>`).join('')}</select></div>${bars}</article>
      ${panel('Tarefas por status', donut('Tarefas', tasksLabels, data.taskCounts))}
      ${panel('Projetos por status', donut('Projetos', ['Em andamento', 'Finalizados', 'Não iniciados'], data.projectCounts, ['#ad69ff', '#3acdae', '#a2a2bb']))}
    </section>
    <section class="stats-grid-linha2">
      ${panel('Economia por mês', `<div class="linha-chart"><svg class="economia-evolucao" viewBox="0 0 400 150" preserveAspectRatio="none" role="img" aria-label="${escape(data.months.map((v, i) => i + 1 + ': ' + money(v)).join('; '))}"><path d="M8 18H392 M8 78H392 M8 138H392" stroke="#e8e8ec" fill="none"/><polygon points="8,138 ${points} 392,138" fill="#983bff22"/><polyline points="${points}" fill="none" stroke="#983bff" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><div class="meses"><span>Jan</span><span>Jun</span><span>Dez</span></div></div><small>Ano ${year}. Valores agrupados pelo prazo das tarefas; não representam datas de recebimento.</small>`)}
      ${panel('Projetos mais econômicos', `<div class="ranking">${ranking.map((p, i) => `<div><span>${escape(p.titulo)}</span><div class="ranking-bar"><i style="width:${(p.total / maxRank) * 100}%;background:${colors[i % 4]}"></i></div><b>${money(p.total)}</b></div>`).join('') || '<p>Nenhum projeto.</p>'}</div>`, `<label class="sr-only" for="stats-top">Quantidade no ranking</label><select id="stats-top">${[5, 10, 20].map((n) => `<option value="${n}" ${Number(top) === n ? 'selected' : ''}>TOP ${n}</option>`).join('')}</select>`)}
      ${panel(
        'Tarefas por projeto',
        `<div class="tarefas-projeto">${
          data.savings
            .map((p) => {
              const counts = [0, 0, 0, 0];
              p.tasks.forEach((t) => counts[taskStatus(t, now)]++);
              return `<div><span>${escape(p.titulo)}</span><div class="task-progress" role="img" aria-label="${escape(tasksLabels.map((label, i) => label + ': ' + counts[i]).join('; '))}">${counts.map((n, i) => `<i style="width:${(n / maxTasks) * 100}%;background:${colors[i]}"></i>`).join('')}</div><b>${p.tasks.length}</b></div>`;
            })
            .join('') || '<p>Nenhuma tarefa.</p>'
        }</div><div class="stats-task-legend">${tasksLabels.map((label, i) => `<span><i class="cor" style="background:${colors[i]}"></i>${label}</span>`).join('')}</div>`
      )}
    </section>`;
}
