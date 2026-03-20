// ════════════════════════════════════
// import.preview.js — tabla de preview y selección
// ════════════════════════════════════

const show = el => el.classList.remove('is-hidden');
const hide = el => el.classList.add('is-hidden');

export let parsedBooks = [];
export let selectedIds = new Set();

export let existingBooks = [];
export function setExistingBooks(books) { existingBooks = books; }
export function setParsedBooks(books)   { parsedBooks   = books; }

// ── Helpers ──
export const statusLabel = s =>
  ({ read: 'leído', reading: 'leyendo', want_to_read: 'pendiente' }[s] ?? s);

export function isDuplicate(book) {
  return existingBooks.find(e =>
    e.title.toLowerCase().trim()  === book.title.toLowerCase().trim() &&
    e.author.toLowerCase().trim() === book.author.toLowerCase().trim()
  ) || null;
}

// ════════════════════════════════════
// TABLA DE PREVIEW
// ════════════════════════════════════

export function buildPreview() {
  selectedIds = new Set();
  const tbody = document.getElementById('import-tbody');
  tbody.innerHTML = '';
  let countNew = 0, countDup = 0;

  parsedBooks.forEach((book, i) => {
    const dup   = isDuplicate(book);
    const isDup = !!dup;
    isDup ? countDup++ : (selectedIds.add(i), countNew++);

    const tr = document.createElement('tr');
    tr.dataset.index = i;
    if (isDup) tr.classList.add('is-duplicate');

    tr.innerHTML = `
      <td><input type="checkbox" class="row-check" data-index="${i}" ${!isDup ? 'checked' : ''}></td>
      <td>${book.title}</td>
      <td>${book.author || '—'}</td>
      <td>${book.total_pages ?? '—'}</td>
      <td>${statusLabel(book.status)}</td>
      <td>${book.date_started  ?? '—'}</td>
      <td>${book.date_finished ?? '—'}</td>
      <td><span class="import-badge ${isDup ? 'import-badge--duplicate' : 'import-badge--new'}">${isDup ? 'duplicado' : 'nuevo'}</span></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.row-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const idx = parseInt(cb.dataset.index);
      cb.checked ? selectedIds.add(idx) : selectedIds.delete(idx);
    });
  });

  document.getElementById('preview-summary').innerHTML =
    `<strong>${parsedBooks.length}</strong> libros encontrados · <strong>${countNew}</strong> nuevos · <strong>${countDup}</strong> duplicados`;

  show(document.getElementById('preview-section'));
  hide(document.getElementById('result-section'));
}

export function resetPreview(fileInput) {
  parsedBooks = [];
  selectedIds.clear();
  hide(document.getElementById('preview-section'));
  hide(document.getElementById('result-section'));
  const filenameEl = document.getElementById('drop-filename');
  filenameEl.textContent = '';
  hide(filenameEl);
  if (fileInput) fileInput.value = '';
}

// ── Listeners de selección ──
document.getElementById('btn-select-all')?.addEventListener('click', () => {
  document.querySelectorAll('.row-check').forEach(cb => {
    cb.checked = true;
    selectedIds.add(parseInt(cb.dataset.index));
  });
});
document.getElementById('btn-deselect-all')?.addEventListener('click', () => {
  document.querySelectorAll('.row-check').forEach(cb => { cb.checked = false; });
  selectedIds.clear();
});