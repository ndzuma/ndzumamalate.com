import { auth as authApi } from './api.js';

let user = $state(null);
let loading = $state(true);
let error = $state(null);

export function getUser() { return user; }
export function isLoading() { return loading; }
export function getError() { return error; }
export function isAuthenticated() { return user !== null; }

export async function checkAuth() {
  loading = true;
  error = null;
  try {
    user = await authApi.me();
  } catch (e) {
    user = null;
  } finally {
    loading = false;
  }
}

export async function login(email, password) {
  loading = true;
  error = null;
  try {
    await authApi.login(email, password);
    user = await authApi.me();
    return true;
  } catch (e) {
    error = e.message || 'Login failed';
    user = null;
    return false;
  } finally {
    loading = false;
  }
}

export async function logout() {
  try {
    await authApi.logout();
  } catch (_) {
    // ignore
  }
  user = null;
  window.location.hash = '#/login';
}

export async function changePassword(currentPassword, newPassword) {
  try {
    await authApi.changePassword(currentPassword, newPassword);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
