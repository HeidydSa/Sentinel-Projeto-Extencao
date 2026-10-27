import { authService } from './container.js';

function currentUser() {
  try {
    const token = localStorage.getItem('auth_token');
    const claims = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
          (c) => c.charCodeAt(0)
        )
      )
    );
    if (!claims.exp || claims.exp * 1000 <= Date.now()) return null;
    const user = JSON.parse(localStorage.getItem('auth_user'));
    return user?.email === claims.email ? user : null;
  } catch {
    return null;
  }
}
function saveUser(user) {
  const session = {
    ...user,
    uid: String(user.id),
    displayName: `${user.nome} ${user.sobrenome}`.trim(),
  };
  localStorage.setItem('auth_user', JSON.stringify(session));
  return session;
}
export const auth = {
  get currentUser() {
    return currentUser();
  },
};
export async function login(email, senha) {
  await authService.login(email, senha);
  try {
    return saveUser(await authService.me());
  } catch (error) {
    await signOut();
    throw error;
  }
}
export async function refreshSession() {
  return saveUser(await authService.me());
}
export async function signOut() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}
export function onAuthStateChanged(_auth, callback) {
  queueMicrotask(() =>
    Promise.resolve(callback(auth.currentUser)).catch(console.error)
  );
}
export async function updateProfile(user, { displayName }) {
  if (!user) throw new Error('Entre novamente para editar o perfil.');
  const names = displayName.trim().split(/\s+/);
  const nome = names.shift();
  return saveUser(
    await authService.profile({
      nome,
      sobrenome: names.join(' ') || user.sobrenome,
    })
  );
}
export async function deleteUser(user) {
  if (!user) throw new Error('Entre novamente para excluir a conta.');
  await authService.removeAccount();
  await signOut();
}
export function requireSession() {
  if (auth.currentUser) return true;
  location.replace('../login/login.html');
  return false;
}
