/* exported render, formatCurrencyShort, esc, setPeriodo, toggleMenu */

import { usuariosService } from '../../config/container.js';
import {
  getState,
  projetosAtivos,
  tarefasFinalizadas,
  formatCurrency,
  economiaTotal,
  economiaPorProjeto,
} from '../../state.js';
import { auth, googleProvider } from '../../config/db_config.js';
import {
  deleteUser,
  updateProfile,
  signOut,
  onAuthStateChanged,
  linkWithPopup,
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';

async function render() {
  const s = await getState();

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

  document.getElementById('kpi-ativos').textContent = projetosAtivos(s).length;
  document.getElementById('kpi-finalizados').textContent =
    tarefasFinalizadas(s).length;
  document.getElementById('kpi-economia').textContent = formatCurrency(
    economiaTotal(s)
  );

  const wrap = document.getElementById('chart-wrap');
  const projComEcon = s.projetos
    .map((p) => ({
      nome: p.descricao,
      econ: economiaPorProjeto(s, p.id),
    }))
    .filter((p) => p.econ > 0);

  if (projComEcon.length === 0) {
    wrap.innerHTML =
      '<p style="color:rgba(255,255,255,.5);text-align:center;padding:2rem;">Nenhum dado disponível.</p>';
    return;
  }

  const maxVal = Math.max(...projComEcon.map((p) => p.econ), 1);

  const descricao = projComEcon
    .map((p) => `${p.descricao}: ${formatCurrency(p.econ)}`)
    .join('; ');
  wrap.setAttribute('aria-label', `Economia por projeto — ${descricao}`);

  wrap.innerHTML = `
    <div class="chart-bars" aria-hidden="true">
      ${projComEcon
        .map((p, i) => {
          const pct = Math.round((p.econ / maxVal) * 100);
          const cls = i % 3 === 1 ? 'bar--2' : i % 3 === 2 ? 'bar--3' : '';
          return `
          <div class="bar-group">
            <div class="bar-group-title">${esc(p.descricao)}</div>
            <div class="bars" style="justify-content:center">
              <div class="bar ${cls}" style="--h:${pct}%;max-width:40px;flex:none;width:40px" title="${esc(p.descricao)}: ${formatCurrency(p.econ)}">
                <span class="bar-val">${formatCurrencyShort(p.econ)}</span>
              </div>
            </div>
          </div>`;
        })
        .join('')}
    </div>
    <div class="chart-legend" aria-hidden="true">
      ${projComEcon
        .map((p, i) => {
          const cls =
            i % 3 === 1 ? 'legend-dot--2' : i % 3 === 2 ? 'legend-dot--3' : '';
          return `<span class="legend-item"><span class="legend-dot ${cls}"></span>${esc(p.descricao)}</span>`;
        })
        .join('')}
    </div>`;
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

function formatCurrencyShort(v) {
  if (v >= 1000) return 'R$' + (v / 1000).toFixed(1) + 'k';
  return 'R$' + v;
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setPeriodo(btn) {
  document.querySelectorAll('.periodo-btn').forEach((b) => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');
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
  Object.assign(window, {
    render,
    formatCurrencyShort,
    esc,
    setPeriodo,
    toggleMenu,
    minimizeMenu,
    deleteAccount,
  });
}

export {
  render,
  formatCurrencyShort,
  esc,
  setPeriodo,
  toggleMenu,
  minimizeMenu,
};
