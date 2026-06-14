/* eslint-disable no-unused-vars */
/* exported togglePw, handleCad */

import { setState } from '../../state.js';
import {
  auth,
  db,
  createUserWithEmailAndPassword,
} from '../../config/db_config.js';

import { updateProfile } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';

function togglePw() {
  const inp = document.getElementById('senha'),
    btn = document.querySelector('.toggle-pw');
  const hide = inp.type === 'password';
  inp.type = hide ? 'text' : 'password';
  btn.setAttribute('aria-label', hide ? 'Ocultar senha' : 'Mostrar senha');
  btn.setAttribute('aria-pressed', hide);
}

let tipoFuncao = '';

window.funcao = function (btn) {
  document.querySelectorAll('.btn-funcao .btn').forEach((b) => {
    b.classList.remove('btn-selected');
  });
  btn.classList.add('btn-selected');

  tipoFuncao = btn.textContent.trim();
};

const EMAIL_ADMIN = 'heidy.g.sa@gmail.com';
const SENHA_ADMIN = 'admin123';

async function handleCad() {
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const senha_adm = document.getElementById('senha_adm').value;

  ['nome', 'email', 'senha'].forEach(
    (id) => (document.getElementById(id + '-error').textContent = '')
  );

  let ok = true;
  if (!nome) {
    document.getElementById('nome-error').textContent = 'O nome é obrigatório.';
    document.getElementById('nome').focus();
    ok = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('email-error').textContent =
      'Informe um e-mail válido.';
    if (ok) document.getElementById('email').focus();
    ok = false;
  }
  if (!senha || senha.length < 8) {
    document.getElementById('senha-error').textContent = 'Mínimo 8 caracteres.';
    if (ok) document.getElementById('senha').focus();
    ok = false;
  }
  if (senha_adm !== SENHA_ADMIN) {
    document.getElementById('email_adm-error').textContent =
      'Senha administrador inválida.';
    return;
  }
  if (!tipoFuncao) {
    document.getElementById('atributo-error').textContent =
      'Selecione uma função';
    ok = false;
  }
  if (!ok) return;

  try {
    const usuariosService = {
      nome,
      email,
      funcao: tipoFuncao,
    };

    console.log(usuariosService);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );

    await updateProfile(userCredential.user, { displayName: nome });

    location.href = '../tarefas/tarefas.html';
  } catch (error) {
    console.error(error);

    if (error.code === 'auth/email-already-in-use') {
      document.getElementById('email-error').textContent =
        'Este e-mail já está cadastrado.';
    } else {
      document.getElementById('email-error').textContent =
        'Erro ao criar usuário.';
    }
  }
}

if (typeof window !== 'undefined') {
  Object.assign(window, { togglePw, handleCad });
}

export { togglePw, handleCad };
