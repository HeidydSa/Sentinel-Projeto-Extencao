import { authService, funcoesService } from '../../config/container.js';
import {
  auth,
  loginSession,
  refreshSession,
} from '../../services/auth_service.js';
import { global } from '../../config/global.js';

function togglePw(inputId, button) {
  const input = document.getElementById(inputId);
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(show));
  button.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
}
let roles = [];
let pending = false;
const button = document.getElementById('cadastroButton');
const feedback = document.getElementById('atributo-error');

async function loadRoles() {
  button.disabled = true;
  try {
    let available = global.PUBLIC_ROLES;
    if (auth.currentUser) {
      await refreshSession();
      available = await funcoesService.getAll();
    }
    roles = available.filter(
      (role) =>
        global.PUBLIC_ROLES.some((allowed) => allowed.id === Number(role.id)) &&
        !/^adm/i.test(role.tipo)
    );
    const select = document.getElementById('funcao-select');
    select.replaceChildren(new Option('Selecione uma função', ''));
    roles.forEach((role) => select.add(new Option(role.tipo, String(role.id))));
    if (!roles.length)
      throw new Error(
        'Cadastro temporariamente indisponível. Entre em contato com a equipe.'
      );
    button.disabled = false;
  } catch (error) {
    feedback.textContent = error.message;
  }
}

async function handleCad() {
  if (pending || !roles.length) return;
  feedback.textContent = '';
  const nome = document.getElementById('nome').value.trim();
  const sobrenome = document.getElementById('sobrenome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const funcaoId = Number(document.getElementById('funcao-select').value);
  document.getElementById('email-error').textContent = '';
  document.getElementById('senha-error').textContent = '';
  if (!nome || !sobrenome) {
    feedback.textContent = 'Preencha nome e sobrenome.';
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
  if (!roles.some((role) => Number(role.id) === funcaoId)) {
    feedback.textContent = 'Selecione uma função.';
    return;
  }
  pending = true;
  button.disabled = true;
  try {
    const wasLoggedIn = Boolean(auth.currentUser);
    await authService.register({ nome, sobrenome, email, senha, funcaoId });
    if (!wasLoggedIn) {
      try {
        await loginSession(email, senha);
      } catch {
        location.href = '../login/login.html?cadastro=sucesso';
        return;
      }
    }
    location.href = '../tarefas/tarefas.html';
  } catch (error) {
    feedback.textContent = error.message;
  } finally {
    pending = false;
    button.disabled = false;
  }
}
button.onclick = handleCad;
Object.assign(window, { togglePw, handleCad });
loadRoles();
export { togglePw, handleCad };
