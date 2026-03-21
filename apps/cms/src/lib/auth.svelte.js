import { auth as authApi } from './api.js';

let user = $state(null);
let loading = $state(true);
let error = $state(null);

export function getUser() { return user; }
export function isLoading() { return loading; }
export function getError() { return error; }
export function isAuthenticated() { return user !== null; }

let pingInterval = null;

export async function checkAuth() {
  loading = true;
  error = null;
  try {
    user = await authApi.me();
    startPing();
  } catch (e) {
    user = null;
    stopPing();
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
    startPing();
    return true;
  } catch (e) {
    error = e.message || 'Login failed';
    user = null;
    stopPing();
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
  stopPing();
  window.location.hash = '#/login';
}

function startPing() {
  if (pingInterval) return;
  pingInterval = setInterval(async () => {
    try {
      await authApi.ping();
    } catch (e) {
      if (e.status === 401) {
        user = null;
        stopPing();
        window.location.hash = '#/login';
      }
    }
  }, 60 * 1000);
}

function stopPing() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    await authApi.changePassword(currentPassword, newPassword);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
