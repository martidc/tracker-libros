import { getBooks } from './books.js';

export let allBooks     = [];
export let activeFilter = 'all';
export let searchTerm   = '';
export let showingAll   = false;

const LIMIT_MOBILE  = 4;
const LIMIT_DESKTOP = 6;

const show = el => el.classList.remove('is-hidden');
const hide = el => el.classList.add('is-hidden');

export function getLimit() {
  return window.innerWidth >= 1000 ? LIMIT_DESKTOP : LIMIT_MOBILE;
}

// cargar y renderizar 

export async function loadBooks() {
  allBooks = await getBooks();
  updateStats();
  updateSidebarWidget();
  showingAll = false;
  renderBooks();
}

export function renderBooks() {
  const grid      = document.getElementById('books-grid');
  const verMasBtn = document.getElementById('btn-ver-mas');

  let list = allBooks;
  if (activeFilter !== 'all') list = list.filter(b => b.status === activeFilter);
  if (searchTerm) list = list.filter(b =>
    b.title.toLowerCase().includes(searchTerm) ||
    b.author.toLowerCase().includes(searchTerm)
  );

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state empty-state--full"><span class="empty-icon"></span>no hay libros aquí :(<br></div>`;
    hide(verMasBtn);
    return;
  }

  const limit   = getLimit();
  const visible = showingAll ? list : list.slice(0, limit);
  const hayMas  = !showingAll && list.length > limit;

  grid.innerHTML = visible.map(book => {
    const badge = {
      reading:      `<span class="badge reading">leyendo</span>`,
      read:         `<span class="badge read">leído</span>`,
      want_to_read: `<span class="badge want">pendiente</span>`,
    }[book.status] || '';

    let progress = '';
    if (book.status === 'reading') {
      if (book.progress_type === 'percentage' && book.current_pct != null) {
        progress = `<div class="progress-wrap"><div class="progress-fill" style="width:${book.current_pct}%"></div></div><span class="book-progress-label">${book.current_pct}%</span>`;
      } else if (book.progress_type === 'pages' && book.current_page != null && book.total_pages) {
        const pct = Math.round((book.current_page / book.total_pages) * 100);
        progress = `<div class="progress-wrap"><div class="progress-fill" style="width:${pct}%"></div></div><span class="book-progress-label">pág. ${book.current_page} / ${book.total_pages}</span>`;
      }
    }

    const cover = book.cover_url
      ? `<img src="${book.cover_url}" alt="portada" />`
      : `<span class="no-cover"><img src="media/cat 319.gif" alt="sin portada" /></span>`;

    return `<div class="book-card" data-id="${book.id}"><div class="book-cover">${cover}</div><div class="book-info"><div class="book-title">${book.title}</div><div class="book-author">${book.author}</div>${badge}${progress}</div></div>`;
  }).join('');

  if (hayMas) {
    verMasBtn.textContent = `+ ver todos (${list.length - limit} más)`;
    show(verMasBtn);
  } else if (showingAll && list.length > limit) {
    verMasBtn.textContent = '− ver menos';
    show(verMasBtn);
  } else {
    hide(verMasBtn);
  }
}

export function updateStats() {
  document.getElementById('count-read').textContent    = allBooks.filter(b => b.status === 'read').length;
  document.getElementById('count-reading').textContent = allBooks.filter(b => b.status === 'reading').length;
  document.getElementById('count-want').textContent    = allBooks.filter(b => b.status === 'want_to_read').length;
}

export function updateSidebarWidget() {
  const totalEl     = document.getElementById('count-total');
  const lastAddedEl = document.getElementById('last-added');
  const lastReadEl  = document.getElementById('last-read');
  if (!totalEl) return;

  totalEl.textContent = allBooks.length;

  const lastAdded = allBooks[0];
  lastAddedEl.textContent = lastAdded ? lastAdded.title : '—';

  const readBooks = allBooks
    .filter(b => b.status === 'read' && b.date_finished)
    .sort((a, b) => (b.date_finished > a.date_finished ? 1 : -1));
  lastReadEl.textContent = readBooks[0]?.title ?? '—';
}

// Event listeners

document.getElementById('btn-ver-mas').addEventListener('click', () => {
  showingAll = !showingAll;
  renderBooks();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    showingAll   = false;
    renderBooks();
  });
});

document.getElementById('btn-search').addEventListener('click', () => {
  searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
  showingAll = true;
  renderBooks();
});
document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    searchTerm = e.target.value.toLowerCase().trim();
    showingAll = true;
    renderBooks();
  }
});
document.getElementById('search-input').addEventListener('input', e => {
  if (!e.target.value) { searchTerm = ''; showingAll = false; renderBooks(); }
});