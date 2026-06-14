/* exported togglePw, handleLogin */

import { projetosService, usuariosService } from '../../config/container.js';
import {
  auth,
  signOut,
  signInWithEmailAndPassword,
  googleProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from '../../config/db_config.js';

console.log(projetosService.getAll().then((p) => console.log(p)));

// Ver a senha
function togglePw() {
  const inp = document.getElementById('senha'),
    btn = document.querySelector('.toggle-pw');
  const hide = inp.type === 'password';
  inp.type = hide ? 'text' : 'password';
  btn.setAttribute('aria-label', hide ? 'Ocultar senha' : 'Mostrar senha');
  btn.setAttribute('aria-pressed', hide);
}

async function handleLogin() {
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
  if (!ok) return;

  try {
    await signInWithEmailAndPassword(auth, email, senha);

    location.href = '../tarefas/tarefas.html';
  } catch (error) {
    console.error(error);

    document.getElementById('senha-error').textContent =
      'E-mail ou senha inválidos.';
  }
}

// Login com o google sem cadastro, precisa das informações do Firestore para funcionar.
async function loginGoogle() {
  try {
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });

    const result = await signInWithPopup(auth, googleProvider);

    const emailGoogle = result.user.email;

    const usuarios = await usuariosService.getAll();

    const usuarioExiste = usuarios.some((u) => u.email === emailGoogle);

    if (!usuarioExiste) {
      await signOut(auth);
      alert('Usuário não cadastrado.');
      return;
    }

    location.href = '../tarefas/tarefas.html';
  } catch (error) {
    console.error(error);
  }
}

window.loginGoogle = loginGoogle;

// Botão esqueci a senha
async function resetSenha() {
  const email = document.getElementById('email').value.trim();

  if (!email) {
    document.getElementById('email-error').textContent =
      'Informe seu e-mail primeiro';
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);

    alert('E-mail de redefinição enviado. \nVerifique a caixa de Span!');
  } catch (error) {
    console.error(error);

    document.getElementById('email-error').textContent =
      'Não foi possível enviar o e-mail';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});

if (typeof window !== 'undefined') {
  Object.assign(window, {
    togglePw,
    handleLogin,
    loginGoogle,
    resetSenha,
  });
}

export { togglePw, handleLogin, loginGoogle };
