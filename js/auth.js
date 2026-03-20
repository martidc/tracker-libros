import { loginWithGoogle, logout, onAuthChanged } from './firebase.js';

// callback a ejecutar cuando cambia el estado de auth
let onLoginCallback  = null;
let onLogoutCallback = null;

export function onLogin(fn)  { onLoginCallback  = fn; }
export function onLogout(fn) { onLogoutCallback = fn; }

export function getCurrentUser() {
  return window._currentUser ?? null;
}

// escuchar cambios de sesión
onAuthChanged(user => {
  window._currentUser = user;
  if (user) {
    onLoginCallback?.(user);
  } else {
    onLogoutCallback?.();
  }
});

export async function login() {
  try {
    await loginWithGoogle();
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      alert('error al iniciar sesión: ' + err.message);
    }
  }
}

export async function cerrarSesion() {
  await logout();
}