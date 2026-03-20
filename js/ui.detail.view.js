// ════════════════════════════════════
// ui.detail.view.js — vista de lectura del modal detalle
// ════════════════════════════════════

import { getBook }   from './books.js';
import { getProgress } from './progress.js';

export const show = el => el.classList.remove('is-hidden');
export const hide = el => el.classList.add('is-hidden');

// Objeto compartido para que ui.detail.edit.js vea los cambios
export const state = { currentBookId: null };

const detailOverlay = document.getElementById('detail-overlay');
export const openDetail  = () => detailOverlay.classList.add('open');
export const closeDetail = () => { detailOverlay.classList.remove('open'); state.currentBookId = null; };

export function showView() {
  show(document.getElementById('detail-view'));
  hide(document.getElementById('detail-edit'));
}
export function showEdit() {
  hide(document.getElementById('detail-view'));
  show(document.getElementById('detail-edit'));
}

// ── Helpers ──
export function formatDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

// ════════════════════════════════════
// ABRIR DETALLE
// ════════════════════════════════════

export async function openBookDetail(bookId) {
  state.currentBookId = bookId;
  const book          = await getBook(bookId);
  if (!book) return;

  populateView(book);
  // import dinámico para evitar dependencia circular
  const { populateEditForm } = await import('./ui.detail.edit.js');
  populateEditForm(book);
  await loadProgressHistory(bookId);
  showView();
  openDetail();
}

// ── Poblar vista de lectura ──
export function populateView(book) {
  document.getElementById('detail-title-header').textContent = '★ ' + book.title;
  document.getElementById('detail-cover').innerHTML = book.cover_url
    ? `<img src="${book.cover_url}" alt="portada" />`
    : '<img src="media/cat 319.gif" alt="sin portada" />';
  document.getElementById('detail-book-title').textContent  = book.title;
  document.getElementById('detail-book-author').textContent = book.author;

  let info = '';
  if (book.published_year) info += book.published_year;
  if (book.total_pages)    info += `${info ? ' · ' : ''}${book.total_pages} págs.`;
  document.getElementById('detail-book-info').textContent = info;

  const badgeMap = {
    reading:      '<span class="badge reading">leyendo</span>',
    read:         '<span class="badge read">leído</span>',
    want_to_read: '<span class="badge want">pendiente</span>',
  };
  document.getElementById('detail-badge-wrap').innerHTML = badgeMap[book.status] ?? '';

  populateProgress(book);
  populateStats(book);
  populateReview(book);
}

function populateProgress(book) {
  const progressWrap = document.getElementById('detail-progress-wrap');
  const bar          = document.getElementById('d-progress-bar');
  const label        = document.getElementById('d-progress-label');

  if (book.status !== 'reading') { hide(progressWrap); return; }

  show(progressWrap);
  if (book.progress_type === 'percentage' && book.current_pct != null) {
    bar.style.width   = book.current_pct + '%';
    label.textContent = book.current_pct + '%';
  } else if (book.progress_type === 'pages' && book.current_page != null && book.total_pages) {
    const pct = Math.round((book.current_page / book.total_pages) * 100);
    bar.style.width   = pct + '%';
    label.textContent = `pág. ${book.current_page} / ${book.total_pages} (${pct}%)`;
  } else {
    bar.style.width   = '0%';
    label.textContent = '';
  }
}

function populateStats(book) {
  const pagesRead = book.status === 'reading' && book.current_page
    ? `${book.current_page} / ${book.total_pages ?? '?'}`
    : (book.total_pages ?? '—');
  document.getElementById('ds-pages').textContent = pagesRead;
  document.getElementById('ds-start').textContent = formatDate(book.date_started) ?? '—';

  const endWrap  = document.getElementById('ds-end-wrap');
  const daysWrap = document.getElementById('ds-days-wrap');

  if (book.date_finished) {
    show(endWrap);
    document.getElementById('ds-end').textContent = formatDate(book.date_finished);
    if (book.date_started) {
      const diff = Math.round(
        (new Date(book.date_finished) - new Date(book.date_started)) / 86400000
      );
      if (diff >= 0) {
        show(daysWrap);
        document.getElementById('ds-days').textContent = diff === 0 ? '1 día' : `${diff} días`;
      }
    }
  } else {
    hide(endWrap);
    hide(daysWrap);
  }
}

function populateReview(book) {
  const reviewWrap = document.getElementById('ds-review-wrap');
  if (book.review?.trim()) {
    show(reviewWrap);
    document.getElementById('ds-review').textContent = book.review;
  } else {
    hide(reviewWrap);
  }
}

// historial de proceso


async function loadProgressHistory(bookId) {
  const histEl  = document.getElementById('d-progress-history');
  const entries = await getProgress(bookId);
  if (!entries.length) {
    histEl.innerHTML = '<div class="progress-history__empty">sin registros todavía</div>';
    return;
  }
  histEl.innerHTML = [...entries].reverse().map(e => {
    const date = e.date?.toDate ? e.date.toDate().toLocaleDateString('es-AR') : '';
    const val  = e.type === 'percentage' ? `${e.value}%` : `pág. ${e.value}`;
    return `<div class="progress-entry"><span class="progress-entry-val">${val}</span>${e.note ? `<span class="progress-entry-note">${e.note}</span>` : ''}<span class="progress-entry-date">${date}</span></div>`;
  }).join('');
}

// listeners de navegación del modal
detailOverlay.addEventListener('click', e => { if (e.target === detailOverlay) closeDetail(); });
document.getElementById('detail-close').addEventListener('click', closeDetail);
document.getElementById('btn-go-edit').addEventListener('click', showEdit);
document.getElementById('btn-go-view').addEventListener('click', showView);

// abrir al hacer click en una card
document.getElementById('books-grid').addEventListener('click', async e => {
  const card = e.target.closest('.book-card');
  if (!card?.dataset.id) return;
  await openBookDetail(card.dataset.id);
});