import { getBooks, addBook, updateBook } from './books.js';
import { parsedBooks, selectedIds, isDuplicate,statusLabel, setExistingBooks }  from './import.preview.js';

const show = el => el.classList.remove('is-hidden');

let skipAll = false;

// importar

document.getElementById('btn-import').addEventListener('click', async () => {
  if (!selectedIds.size) { alert('seleccioná al menos un libro'); return; }

  const btn = document.getElementById('btn-import');
  btn.textContent = 'importando...';
  btn.disabled    = true;
  skipAll         = false;

  let imported = 0, skipped = 0, overwritten = 0, errors = 0;

  for (const i of selectedIds) {
    const book = parsedBooks[i];
    const dup  = isDuplicate(book);
    try {
      if (dup) {
        const action = skipAll ? 'skip' : await askDuplicate(book, dup);
        if (action === 'skip') {
          skipped++;
          markRow(book, 'skipped');
        } else {
          await updateBook(dup.id, buildBookData(book));
          overwritten++;
          markRow(book, 'done');
        }
      } else {
        await addBook(buildBookData(book));
        imported++;
        markRow(book, 'done');
      }
    } catch (err) {
      console.error('error importando', book.title, err);
      errors++;
      markRow(book, 'error');
    }
  }

  setExistingBooks(await getBooks());
  btn.textContent = '★ importar seleccionados ★';
  btn.disabled    = false;
  showResult({ imported, skipped, overwritten, errors });
});

// helpers
function buildBookData(book) {
  return {
    title:          book.title,
    author:         book.author,
    total_pages:    book.total_pages    ?? null,
    cover_url:      null,
    published_year: book.published_year ?? null,
    language:       book.language       ?? null,
    status:         book.status         ?? 'want_to_read',
    progress_type:  'pages',
    current_page:   null,
    current_pct:    null,
    review:         book.review         ?? '',
    date_started:   book.date_started   ?? null,
    date_finished:  book.date_finished  ?? null,
  };
}

function markRow(book, state) {
  const idx   = parsedBooks.indexOf(book);
  const tr    = document.querySelector(`tr[data-index="${idx}"]`);
  const badge = tr?.querySelector('.import-badge');
  if (!badge) return;
  badge.className   = `import-badge import-badge--${state}`;
  badge.textContent = ({ done: '✓ importado', skipped: 'saltado', error: 'error' })[state] ?? state;
  if (state === 'skipped') tr.classList.add('is-skipped');
}

function showResult({ imported, skipped, overwritten, errors }) {
  document.getElementById('result-box').innerHTML = `
    <div class="result-line result-ok"><strong>${imported}</strong> libros importados correctamente</div>
    ${overwritten ? `<div class="result-line result-warn"><strong>${overwritten}</strong> sobreescritos</div>` : ''}
    ${skipped     ? `<div class="result-line"><strong>${skipped}</strong> saltados</div>`                     : ''}
    ${errors      ? `<div class="result-line result-err"><strong>${errors}</strong> con error</div>`          : ''}
  `;
  show(document.getElementById('result-section'));
}

// modal duplicado

function askDuplicate(newBook, existingBook) {
  return new Promise(resolve => {
    const overlay = document.getElementById('duplicate-overlay');
    document.getElementById('duplicate-msg').textContent =
      `"${newBook.title}" ya existe en tu biblioteca. ¿Qué querés hacer?`;
    document.getElementById('duplicate-info').innerHTML = `
      <strong>${existingBook.title}</strong><br>
      ${existingBook.author}<br>
      estado actual: ${statusLabel(existingBook.status)}
      ${existingBook.total_pages ? ` · ${existingBook.total_pages} págs.` : ''}
    `;
    overlay.classList.add('open');

    const cleanup = () => overlay.classList.remove('open');
    document.getElementById('btn-dup-skip').onclick      = () => { cleanup(); resolve('skip'); };
    document.getElementById('btn-dup-overwrite').onclick = () => { cleanup(); resolve('overwrite'); };
    document.getElementById('btn-dup-skip-all').onclick  = () => { skipAll = true; cleanup(); resolve('skip'); };
  });
}