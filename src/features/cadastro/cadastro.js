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

async function handleCad() {
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

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

  /*if (ok) {
    setState((s) => {
      const partes = nome.trim().split(' ');
      s.usuario = {
        nome,
        iniciais: (
          partes[0][0] + (partes[1] ? partes[1][0] : partes[0][1] || '')
        ).toUpperCase(),
      };
    });
    location.href = '../tarefas/tarefas.html';
  }*/
  if (!ok) return;

  try {
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
