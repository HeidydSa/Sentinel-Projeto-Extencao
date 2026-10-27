import { Usuario } from '../models/Usuario.model.js';
import { AuthClient } from '../client/auth.client.js';
import { BaseClient } from '../client/base.client.js';
import { isNonEmptyString } from '../utils/typeValidations.js';
import { global } from '../config/global.js';

export class AuthService {
  constructor(client) {
    this.client = client;
  }
  register(payload) {
    if (
      !global.PUBLIC_ROLES.some((role) => role.id === Number(payload.funcaoId))
    ) {
      throw new TypeError('Esta função não está disponível para cadastro.');
    }
    const user = new Usuario(payload);
    if (!isNonEmptyString(payload.senha) || payload.senha.length < 8)
      throw new TypeError('A senha deve ter pelo menos 8 caracteres.');
    return this.client.register({
      ...user.toJSON(),
      senha: payload.senha,
      funcaoId: Number(user.funcaoId),
    });
  }
  login(email, senha) {
    if (!isNonEmptyString(email) || !isNonEmptyString(senha))
      throw new TypeError('Email e senha são obrigatórios.');
    return this.client.login(email, senha);
  }
}

const sessionClient = new AuthClient();
const usersClient = new BaseClient({ path: '/usuarios' });
function claims() {
  try {
    const part = localStorage
      .getItem('auth_token')
      .split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const data = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(part), (c) => c.charCodeAt(0))
      )
    );
    return data.exp * 1000 > Date.now() ? data : null;
  } catch {
    return null;
  }
}
function currentUser() {
  try {
    const token = claims();
    const user = JSON.parse(localStorage.getItem('auth_user'));
    return token && user?.email === token.email ? user : null;
  } catch {
    return null;
  }
}
export const auth = {
  get currentUser() {
    return currentUser();
  },
};
export async function refreshSession() {
  const token = claims();
  if (!token) {
    await signOut();
    throw new Error('Sessão expirada. Entre novamente.');
  }
  const users = await usersClient.getAll();
  const user = users.find((u) => u.email === token.email);
  if (!user) {
    await signOut();
    throw new Error('Usuário não encontrado. Entre novamente.');
  }
  const profile = new Usuario(user).toJSON();
  const session = {
    ...profile,
    uid: String(user.id),
    displayName: `${user.nome} ${user.sobrenome}`.trim(),
  };
  localStorage.setItem('auth_user', JSON.stringify(session));
  return session;
}
export async function loginSession(email, senha) {
  await sessionClient.login(email, senha);
  try {
    return await refreshSession();
  } catch (error) {
    await signOut();
    throw error;
  }
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
export function requireSession() {
  if (auth.currentUser) return true;
  location.replace('../login/login.html');
  return false;
}
export async function deleteUser(user) {
  if (!user) throw new Error('Entre novamente.');
  await usersClient.delete(user.uid);
  await signOut();
}
export function updateProfile() {
  throw new Error('A edição do perfil ainda não é suportada pela API atual.');
}
