import { getBooks, updateBook, deleteBook } from './books.js';
import { logProgress } from './progress.js';
import { toggleProgressFields } from './ui.modals.js';
import { allBooks, updateStats, updateSidebarWidget, renderBooks } from './ui.books.js';
import { state, openBookDetail, showView, closeDetail } from './ui.detail.view.js';

async function refreshStats() {
  try { const m = await import('./stats.js'); await m.refreshStats(); }
  catch (err) { console.warn('refreshStats falló:', err); }
}

// Poblar formulario de edición
export function populateEditForm(book) {
  document.getElementById('d-cover-url').value     = book.cover_url     ?? '';
  document.getElementById('d-status').value        = book.status        ?? 'want_to_read';
  document.getElementById('d-progress-type').value = book.progress_type ?? 'pages';
  toggleProgressFields('d-progress-type', 'd-pages-row', 'd-pct-row');
  document.getElementById('d-total-pages').value   = book.total_pages   ?? '';
  document.getElementById('d-current-page').value  = book.current_page  ?? '';
  document.getElementById('d-current-pct').value   = book.current_pct   ?? '';
  document.getElementById('d-date-start').value    = book.date_started  ?? '';
  document.getElementById('d-date-end').value      = book.date_finished ?? '';
  document.getElementById('d-review').value        = book.review        ?? '';
}

document.getElementById('d-progress-type').addEventListener('change', () => {
  toggleProgressFields('d-progress-type', 'd-pages-row', 'd-pct-row');
});

// guardar cambios

document.getElementById('btn-detail-save').addEventListener('click', async () => {
  if (!state.currentBookId) return;

  const progressType = document.getElementById('d-progress-type').value;
  const newPage      = parseInt(document.getElementById('d-current-page').value) || null;
  const newPct       = parseInt(document.getElementById('d-current-pct').value)  || null;
  const oldBook      = allBooks.find(b => b.id === state.currentBookId);
  const rawCover     = document.getElementById('d-cover-url').value.trim();

  const updates = {
    status:        document.getElementById('d-status').value,
    progress_type: progressType,
    total_pages:   parseInt(document.getElementById('d-total-pages').value) || null,
    current_page:  progressType === 'pages'      ? newPage : null,
    current_pct:   progressType === 'percentage' ? newPct  : null,
    review:        document.getElementById('d-review').value.trim(),
    date_started:  document.getElementById('d-date-start').value || null,
    date_finished: document.getElementById('d-date-end').value   || null,
    cover_url:     rawCover.length > 0 ? rawCover : null,
  };

  const btn = document.getElementById('btn-detail-save');
  btn.textContent = 'guardando...'; btn.disabled = true;

  try {
    const progressChanged =
      (progressType === 'pages'      && newPage != null && newPage !== oldBook?.current_page) ||
      (progressType === 'percentage' && newPct  != null && newPct  !== oldBook?.current_pct);

    await updateBook(state.currentBookId, updates);
    if (progressChanged) {
      await logProgress(state.currentBookId, {
        type:  progressType,
        value: progressType === 'pages' ? newPage : newPct,
      });
    }

    await refreshStats();
    const fresh = await getBooks();
    allBooks.length = 0; allBooks.push(...fresh);
    updateStats(); updateSidebarWidget(); renderBooks();
    await openBookDetail(state.currentBookId);
    showView();
  } catch (err) {
    alert('error al guardar: ' + err.message);
  } finally {
    btn.textContent = '★ guardar ★'; btn.disabled = false;
  }
});

// eliminar libro

document.getElementById('btn-detail-delete').addEventListener('click', async () => {
  if (!state.currentBookId) return;
  const book = allBooks.find(b => b.id === state.currentBookId);
  if (!confirm(`¿Eliminar "${book?.title}"? Esta acción no se puede deshacer.`)) return;
  try {
    await deleteBook(state.currentBookId);
    await refreshStats();
    const fresh = await getBooks();
    allBooks.length = 0; allBooks.push(...fresh);
    updateStats(); updateSidebarWidget(); renderBooks(); closeDetail();
  } catch (err) {
    alert('error al eliminar: ' + err.message);
  }
});