import { authService } from '../../config/container.js';
import { auth, login } from '../../config/session.js';

function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.setAttribute('aria-pressed', String(show));
}
let pending = false;
async function loadRoles() {
  const select = document.getElementById('funcao-select');
  try {
    const roles = await authService.roles();
    for (const role of roles)
      select.add(new Option(role.tipo, String(role.id)));
    if (!roles.length)
      throw new Error(
        'Nenhuma função disponível para cadastro. Contate o administrador.'
      );
  } catch (error) {
    document.getElementById('atributo-error').textContent = error.message;
  }
}
async function handleCad() {
  if (pending) return;
  const error = document.getElementById('atributo-error');
  error.textContent = '';
  const nome = document.getElementById('nome').value.trim();
  const sobrenome = document.getElementById('sobrenome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const funcaoId = Number(document.getElementById('funcao-select').value);
  document.getElementById('email-error').textContent = '';
  document.getElementById('senha-error').textContent = '';
  if (!nome || !sobrenome) {
    error.textContent = 'Preencha nome e sobrenome.';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('email-error').textContent =
      'Informe um e-mail válido.';
    return;
  }
  if (senha.length < 8) {
    document.getElementById('senha-error').textContent = 'Mínimo 8 caracteres.';
    return;
  }
  if (!Number.isInteger(funcaoId) || funcaoId <= 0) {
    error.textContent = 'Selecione uma função.';
    return;
  }
  pending = true;
  document.getElementById('cadastroButton').disabled = true;
  try {
    const wasLoggedIn = Boolean(auth.currentUser);
    await authService.register({ nome, sobrenome, email, senha, funcaoId });
    if (!wasLoggedIn) await login(email, senha);
    location.href = '../tarefas/tarefas.html';
  } catch (e) {
    error.textContent = e.message;
  } finally {
    pending = false;
    document.getElementById('cadastroButton').disabled = false;
  }
}
document.getElementById('cadastroButton').onclick = handleCad;
Object.assign(window, { togglePw, handleCad });
loadRoles();
export { togglePw, handleCad };
