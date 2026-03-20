import { addBook, getBooks } from './books.js';
import { allBooks, updateStats, updateSidebarWidget, renderBooks } from './ui.books.js';

async function refreshStats() {
  try { const m = await import('./stats.js'); await m.refreshStats(); }
  catch (err) { console.warn('refreshStats falló:', err); }
}

const show = el => el.classList.remove('is-hidden');
const hide = el => el.classList.add('is-hidden');

// ── toggle páginas / porcentaje ──
export function toggleProgressFields(typeId, pagesRowId, pctRowId) {
  const type = document.getElementById(typeId).value;
  if (type === 'percentage') {
    hide(document.getElementById(pagesRowId));
    show(document.getElementById(pctRowId));
  } else {
    show(document.getElementById(pagesRowId));
    hide(document.getElementById(pctRowId));
  }
}

// busca portada google books
async function fetchGoogleBooksCover(title, author) {
  try {
    const q    = encodeURIComponent(`${title} ${author}`);
    const res  = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
    const data = await res.json();
    return data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail?.replace('http://', 'https://') ?? null;
  } catch { return null; }
}

// buscar páginas open library
async function fetchPageCount(olKey) {
  if (!olKey) return null;
  try {
    const res   = await fetch(`https://openlibrary.org${olKey}/editions.json?limit=10`);
    const data  = await res.json();
    const pages = data.entries
      ?.map(e => e.number_of_pages)
      .filter(n => n && n > 10)
      .sort((a, b) => a - b);
    if (pages?.length) return pages[Math.floor(pages.length / 2)];
  } catch {}
  return null;
}

// modal agregar

const overlay = document.getElementById('modal-overlay');

export const openModal = () => overlay.classList.add('open');

export const closeModal = () => {
  overlay.classList.remove('open');
  ['f-title','f-author','f-cover-url','f-year','f-total-pages','f-current-page',
   'f-current-pct','f-review','f-date-start','f-date-end','ol-search'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('f-status').value        = 'want_to_read';
  document.getElementById('f-progress-type').value = 'pages';
  toggleProgressFields('f-progress-type', 'pages-row', 'pct-row');
  const res = document.getElementById('ol-results');
  res.innerHTML = ''; res.classList.remove('open');
};

document.getElementById('btn-open-modal').addEventListener('click', e => { e.preventDefault(); openModal(); });
document.getElementById('modal-close').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

document.getElementById('f-progress-type').addEventListener('change', () => {
  toggleProgressFields('f-progress-type', 'pages-row', 'pct-row');
});

// ── Búsqueda Open Library ──
document.getElementById('btn-ol-search').addEventListener('click', async () => {
  const q = document.getElementById('ol-search').value.trim();
  if (!q) return;

  const res  = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6&fields=title,author_name,first_publish_year,cover_i,key,number_of_pages_median`);
  const data = await res.json();
  const box  = document.getElementById('ol-results');
  box.innerHTML = '';

  if (!data.docs?.length) {
    box.innerHTML = '<div class="progress-history__empty">sin resultados</div>';
  } else {
    data.docs.slice(0, 6).forEach(doc => {
      const thumbUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg` : null;
      const item = document.createElement('div');
      item.className = 'ol-item';
      item.innerHTML = `
        ${thumbUrl ? `<img src="${thumbUrl}" alt="" />` : '<span style="font-size:24px">📖</span>'}
        <div class="ol-item-info">
          <div class="ol-item-title">${doc.title}</div>
          <div class="ol-item-author">${doc.author_name?.[0] ?? 'autor desconocido'}</div>
          <div class="ol-item-extra">${doc.first_publish_year ?? ''}${doc.number_of_pages_median ? ` · ${doc.number_of_pages_median} págs.` : ''}</div>
        </div>`;

      item.addEventListener('click', async () => {
        document.getElementById('f-title').value  = doc.title;
        document.getElementById('f-author').value = doc.author_name?.[0] ?? '';
        document.getElementById('f-year').value   = doc.first_publish_year ?? '';

        let pages = doc.number_of_pages_median ?? null;
        if (!pages && doc.key) pages = await fetchPageCount(doc.key);
        if (pages) document.getElementById('f-total-pages').value = pages;

        let cover = doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : await fetchGoogleBooksCover(doc.title, doc.author_name?.[0] ?? '');
        document.getElementById('f-cover-url').value = cover ?? '';

        box.innerHTML = ''; box.classList.remove('open');
      });
      box.appendChild(item);
    });
  }
  box.classList.add('open');
});

// ── guardar libro nuevo ──
document.getElementById('btn-save').addEventListener('click', async () => {
  const title  = document.getElementById('f-title').value.trim();
  const author = document.getElementById('f-author').value.trim();
  if (!title || !author) { alert('título y autor son obligatorios'); return; }

  const progressType = document.getElementById('f-progress-type').value;
  const bookData = {
    title, author,
    cover_url:      document.getElementById('f-cover-url').value.trim() || null,
    published_year: parseInt(document.getElementById('f-year').value)   || null,
    status:         document.getElementById('f-status').value,
    progress_type:  progressType,
    current_page:   progressType === 'pages'      ? parseInt(document.getElementById('f-current-page').value) || null : null,
    current_pct:    progressType === 'percentage' ? parseInt(document.getElementById('f-current-pct').value)  || null : null,
    total_pages:    parseInt(document.getElementById('f-total-pages').value) || null,
    review:         document.getElementById('f-review').value.trim(),
    date_started:   document.getElementById('f-date-start').value || null,
    date_finished:  document.getElementById('f-date-end').value   || null,
  };

  const btn = document.getElementById('btn-save');
  btn.textContent = 'guardando...'; btn.disabled = true;
  try {
    await addBook(bookData);
    await refreshStats();
    // recargar lista global
    const fresh = await getBooks();
    allBooks.length = 0; allBooks.push(...fresh);
    updateStats(); updateSidebarWidget(); renderBooks(); closeModal();
  } catch (err) {
    alert('error al guardar: ' + err.message);
  } finally {
    btn.textContent = '★ guardar libro ★'; btn.disabled = false;
  }
});