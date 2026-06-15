import { projetosService, usuariosService } from '../../config/container.js';
import { auth, googleProvider } from '../../config/db_config.js';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';

console.log(projetosService.getAll().then((p) => console.log(p)));

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
    await signInWithEmailAndPassword(auth, email, senha_login);
    location.href = '../tarefas/tarefas.html';
  } catch (error) {
    console.error(error);
    document.getElementById('senha-error').textContent =
      'E-mail ou senha inválidos.';
  }
}

// Login com o google somente quem vinculou.
async function loginGoogle() {
  try {
    // 1. Forçamos o Google a sempre pedir para selecionar a conta (evita logins automáticos indesejados)
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    // 2. Abre o popup para autenticar
    const resultado = await signInWithPopup(auth, googleProvider);
    const usuarioGoogle = resultado.user;

    // 3. Buscamos a sua lista de usuários cadastrados no seu banco de dados
    const usuarios = await usuariosService.getAll();
    const usuarioExisteNoBanco = usuarios.find(
      (u) => u.email === usuarioGoogle.email
    );

    // 4. Verificamos se essa conta Google REALMENTE tem o vínculo de senha prévio
    const provedores = usuarioGoogle.providerData.map((p) => p.providerId);
    const possuiSenhaVinculada = provedores.includes('password');

    // SE NÃO EXISTE NO BANCO OU NÃO FOI VINCULADO PREVIAMENTE:
    if (!usuarioExisteNoBanco || !possuiSenhaVinculada) {
      // Desloga o usuário imediatamente para limpar a sessão local
      await signOut(auth);

      // Se o usuário foi criado agora por acidente (não tem senha), o próprio Firebase limpa se deslogado sem persistência,
      // mas para garantir que a conta original de e-mail/senha dele não seja corrompida:
      alert(
        'Acesso negado. Esta conta Google não está vinculada a nenhum usuário. Faça login com e-mail/senha e vincule-a no painel de tarefas.'
      );
      return;
    }

    // Se passou por todas as validações, o usuário é legítimo e já tinha se vinculado antes
    location.href = '../tarefas/tarefas.html';
  } catch (erro) {
    console.error(erro);
    // Se o erro for de conta já existente com provedor diferente, o Firebase vai disparar isso:
    if (erro.code === 'auth/account-exists-with-different-credential') {
      alert(
        'Esta conta Google ainda não foi vinculada ao seu e-mail. Faça o login tradicional primeiro.'
      );
    } else {
      alert('Erro ao tentar fazer login com o Google.');
    }
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
