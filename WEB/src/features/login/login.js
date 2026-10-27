import { authService, projetosService } from '../../config/container.js';

console.log(projetosService.getAll().then((p) => console.log(p)));

document
  .getElementById('login-btn')
  .addEventListener('click', () => handleLogin());

// Ver a senha
function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);

  const hide = inp.type === 'password';
  inp.type = hide ? 'text' : 'password';

  btn.setAttribute('aria-label', hide ? 'Ocultar senha' : 'Mostrar senha');
  btn.setAttribute('aria-pressed', hide);
  btn.innerHTML = hide ? '⎯⎯' : '&#128065;';
}

async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const senha_login = document.getElementById('senha_login').value;

  document.getElementById('email-error').textContent = '';
  document.getElementById('senha-error').textContent = '';

  let ok = true;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('email-error').textContent =
      'Informe um e-mail válido.';
    document.getElementById('email').focus();
    ok = false;
  }
  if (!senha_login) {
    document.getElementById('senha-error').textContent =
      'A senha é obrigatória.';
    if (ok) document.getElementById('senha_login').focus();
    ok = false;
  }
  if (!ok) return;

  try {
    await authService.login(email, senha_login);
    location.href = '../tarefas/tarefas.html';
  } catch (error) {
    console.error(error);
    document.getElementById('senha-error').textContent =
      'E-mail ou senha inválidos.';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});

if (typeof window !== 'undefined') {
  Object.assign(window, {
    togglePw,
    handleLogin,
  });
}

export { togglePw, handleLogin };
