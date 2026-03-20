// stats.mes.js — modal "este mes"

import { MESES, renderChartMesSemanas } from './stats.charts.js';
import { reloadBooks }                  from './stats.ui.js';

export let allBooks = [];
export function setAllBooks(books) { allBooks = books; }

// listerners

document.getElementById('btn-open-mes').addEventListener('click', async () => {
  await reloadBooks();
  renderMes();
  document.getElementById('overlay-mes').classList.add('open');
});
document.getElementById('close-mes').addEventListener('click', () =>
  document.getElementById('overlay-mes').classList.remove('open')
);
document.getElementById('overlay-mes').addEventListener('click', e => {
  if (e.target === document.getElementById('overlay-mes'))
    document.getElementById('overlay-mes').classList.remove('open');
});

// render

function renderMes() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  document.getElementById('mes-titulo').textContent = `★ ${MESES[month]} ${year} ★`;

  const books = allBooks.filter(b => {
    if (b.status !== 'read' || !b.date_finished) return false;
    const d = new Date(b.date_finished);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const totalPages = books.reduce((s, b) => s + (b.total_pages ?? 0), 0);
  const longest    = books.reduce((max, b) =>
    (b.total_pages ?? 0) > (max?.total_pages ?? 0) ? b : max, null);
  const daysArr    = books
    .filter(b => b.date_started && b.date_finished)
    .map(b => Math.round((new Date(b.date_finished) - new Date(b.date_started)) / 86400000))
    .filter(d => d >= 0);
  const avgDays    = daysArr.length
    ? Math.round(daysArr.reduce((a, b) => a + b, 0) / daysArr.length)
    : null;

  document.getElementById('mes-read').textContent     = books.length;
  document.getElementById('mes-pages').textContent    = totalPages.toLocaleString('es-AR');
  document.getElementById('mes-avg-days').textContent = avgDays ?? '—';
  document.getElementById('mes-longest').textContent  = longest?.total_pages ?? '—';

  renderChartMesSemanas(books, year, month);
  renderBooksList(books);
}

function renderBooksList(books) {
  const listEl = document.getElementById('mes-books-list');
  if (!books.length) {
    listEl.innerHTML = '<div class="empty-month">ningún libro terminado este mes todavía</div>';
    return;
  }
  listEl.innerHTML = books.map(b => `
    <div class="month-book-row">
      <div class="month-book-cover">
        ${b.cover_url ? `<img src="${b.cover_url}" alt="" />` : '📖'}
      </div>
      <div>
        <div class="month-book-title">${b.title}</div>
        <div class="month-book-author">${b.author}</div>
      </div>
      ${b.total_pages ? `<div class="month-book-pages">${b.total_pages} págs.</div>` : ''}
    </div>`).join('');
}