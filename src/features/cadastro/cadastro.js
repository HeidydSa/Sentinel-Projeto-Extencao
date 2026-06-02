/* eslint-disable no-unused-vars */
/* exported togglePw, handleCad */

import { setState } from '../../state.js';

function togglePw() {
  const inp = document.getElementById('senha'),
    btn = document.querySelector('.toggle-pw');
  const hide = inp.type === 'password';
  inp.type = hide ? 'text' : 'password';
  btn.setAttribute('aria-label', hide ? 'Ocultar senha' : 'Mostrar senha');
  btn.setAttribute('aria-pressed', hide);
}

function handleCad() {
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

  if (ok) {
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
  }
}

if (typeof window !== 'undefined') {
  Object.assign(window, { togglePw, handleCad });
}

export { togglePw, handleCad };
