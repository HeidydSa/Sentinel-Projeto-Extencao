/* eslint-disable no-unused-vars */
/* exported togglePw, handleCad */

import { setState } from '../../state.js';
import { auth, db } from '../../config/db_config.js';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';
import { usuariosService } from '../../config/container.js';
import { Usuario } from '../../models/Usuario.model.js';

function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);

  const hide = inp.type === 'password';
  inp.type = hide ? 'text' : 'password';

  btn.setAttribute('aria-label', hide ? 'Ocultar senha' : 'Mostrar senha');
  btn.setAttribute('aria-pressed', hide);
  btn.innerHTML = hide ? '⎯⎯' : '&#128065;';
}

let tipoFuncao = '';

window.funcao = function (btn) {
  if (!btn) return;

  // remove seleção por ID
  document.getElementById('lider')?.classList.remove('btn-selected');
  document.getElementById('dev')?.classList.remove('btn-selected');
  document.getElementById('analista')?.classList.remove('btn-selected');
  document.getElementById('admin')?.classList.remove('btn-selected');

  // aplica no clicado
  btn.classList.add('btn-selected');

  // salva valor
  tipoFuncao = btn.dataset.role;
};

function getFuncaoSelecionada() {
  return document.querySelector('.btn-funcao .btn-selected')?.dataset.role;
}

async function handleCad() {
  const nome = document.getElementById('nome').value.trim();
  const sobrenome = document.getElementById('sobrenome').value.trim() || 'N/A';
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const senhaAdm = document.getElementById('senha_adm').value;

  let ok = true;

  if (!senhaAdm) {
    document.getElementById('senha_adm-error').textContent =
      'Informe a senha do admin';
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
  if (!tipoFuncao) {
    document.getElementById('atributo-error').textContent =
      'Selecione uma função';
    return;
  }

  if (!ok) return;

  try {
    // 1. pega admin logado
    const admin = auth.currentUser;
    const adminEmail = auth.currentUser.email;

    // 2. reautentica admin
    const credential = EmailAuthProvider.credential(admin.email, senhaAdm);
    await reauthenticateWithCredential(admin, credential);

    // 3. cria usuário novo
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );

    await updateProfile(userCredential.user, {
      displayName: nome,
    });

    // 4. salva no Firestore (com função)
    const usuario = new Usuario(
      userCredential.user.uid,
      nome,
      sobrenome,
      email,
      new Date(),
      tipoFuncao
    );

    await usuariosService.create(usuario);

    await signOut(auth);
    await signInWithEmailAndPassword(auth, adminEmail, senhaAdm);

    location.href = '../tarefas/tarefas.html';
  } catch (error) {
    console.error(error);

    document.getElementById('senha_adm-error').textContent =
      'Senha do admin incorreta ou erro de autenticação';
  }
}

/* CONTROLE DO BOTÃO ADMIN */

onAuthStateChanged(auth, (user) => {
  const btn = document.getElementById('admin');
  if (!btn) return;

  btn.style.display = 'none';

  if (user && user.email === 'adm@gmail.com') {
    btn.style.display = 'block';
  }
});

if (typeof window !== 'undefined') {
  Object.assign(window, { togglePw, handleCad });
}

export { togglePw, handleCad };
