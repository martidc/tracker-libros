// ════════════════════════════════════
// auth.ui.js — login/logout para stats e import
// ════════════════════════════════════

import { onLogin, onLogout, login, cerrarSesion } from './auth.js';

const loginScreen = document.getElementById('login-screen');
const btnLogout   = document.getElementById('btn-logout');
const btnLogin    = document.getElementById('btn-login');

// Ocultar hasta saber el estado de auth
loginScreen.classList.add('is-hidden');

onLogin(() => {
  loginScreen.classList.add('is-hidden');
  btnLogout.classList.remove('is-hidden'); 
  btnLogout.style.visibility = 'visible';
  btnLogout.style.display = '';
});

onLogout(() => {
  loginScreen.classList.remove('is-hidden');
  btnLogout.classList.add('is-hidden'); 
    btnLogout.style.visibility = 'hidden';

  btnLogout.style.display = 'none';
});

btnLogin.addEventListener('click', login);
btnLogout.addEventListener('click', cerrarSesion);