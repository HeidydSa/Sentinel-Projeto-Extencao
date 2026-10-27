import { login } from '../../config/session.js';

function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
  btn.setAttribute('aria-pressed', String(show));
}
let pending = false;
async function handleLogin() {
  if (pending) return;
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha_login').value;
  const error = document.getElementById('senha-error');
  document.getElementById('email-error').textContent = '';
  error.textContent = '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('email-error').textContent =
      'Informe um e-mail válido.';
    return;
  }
  if (!senha) {
    error.textContent = 'A senha é obrigatória.';
    return;
  }
  pending = true;
  try {
    await login(email, senha);
    location.href = '../tarefas/tarefas.html';
  } catch (e) {
    error.textContent = e.message;
  } finally {
    pending = false;
  }
}
document.getElementById('login-btn').onclick = handleLogin;
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});
Object.assign(window, { togglePw, handleLogin });
export { togglePw, handleLogin };
