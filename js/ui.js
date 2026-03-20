// ════════════════════════════════════
// ui.js — entry point
// ════════════════════════════════════

import { loadBooks }          from './ui.books.js';
import './ui.modals.js';
import './ui.detail.view.js';
import './ui.detail.edit.js';
import { onLogin, onLogout, login, cerrarSesion } from './auth.js';

const loginScreen = document.getElementById('login-screen');
const btnLogout   = document.getElementById('btn-logout');
const btnLogin    = document.getElementById('btn-login');

// Ocultar login screen hasta saber el estado de auth
loginScreen.classList.add('is-hidden');

let booksLoaded = false;

// Mostrar app cuando hay sesión
onLogin(user => {
  loginScreen.classList.add('is-hidden');
  btnLogout.style.visibility = 'visible';
  if (!booksLoaded) { loadBooks(); booksLoaded = true; }
});

// Mostrar login cuando no hay sesión
onLogout(() => {
  loginScreen.classList.remove('is-hidden');
  btnLogout.style.visibility = 'hidden';
  booksLoaded = false;
});

btnLogin.addEventListener('click', login);
btnLogout.addEventListener('click', cerrarSesion);