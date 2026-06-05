/* exported togglePw, handleLogin */

import { projetosService } from '../../config/container.js';

console.log(projetosService.getAll().then((p) => console.log(p)));

function togglePw() {
  const inp = document.getElementById('senha'),
    btn = document.querySelector('.toggle-pw');
  const hide = inp.type === 'password';
  inp.type = hide ? 'text' : 'password';
  btn.setAttribute('aria-label', hide ? 'Ocultar senha' : 'Mostrar senha');
  btn.setAttribute('aria-pressed', hide);
}

function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  document.getElementById('email-error').textContent = '';
  document.getElementById('senha-error').textContent = '';

  let ok = true;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('email-error').textContent =
      'Informe um e-mail válido.';
    document.getElementById('email').focus();
    ok = false;
  }
  if (!senha) {
    document.getElementById('senha-error').textContent =
      'A senha é obrigatória.';
    if (ok) document.getElementById('senha').focus();
    ok = false;
  }
  if (senha.length < 8) {
    document.getElementById('senha-error').textContent =
      'A senha deve conter no mínimo 8 digitos.';
    if (ok) document.getElementById('senha').focus();
    ok = false;
  }
  if (ok) location.href = '../tarefas/tarefas.html';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});

if (typeof window !== 'undefined') {
  Object.assign(window, { togglePw, handleLogin });
}

export { togglePw, handleLogin };
