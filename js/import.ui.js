import { getBooks }                                      from './books.js';
import { parseCSV }                                      from './import.parser.js';
import { buildPreview, resetPreview,
         setParsedBooks, setExistingBooks }              from './import.preview.js';
import './import.importer.js';

const show = el => el.classList.remove('is-hidden');
const hide = el => el.classList.add('is-hidden');

let currentSource = 'sheets';

// ── Cargar libros existentes ──
async function loadExisting() {
  try {
    setExistingBooks(await getBooks());
  } catch (err) {
    console.warn('no se pudieron cargar libros existentes (sin conexión?):', err);
  }
}
loadExisting();

// selector de fuente

document.querySelectorAll('.source-card').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.source-card').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSource = btn.dataset.source;
    document.getElementById('instructions-sheets').classList.toggle('is-hidden', currentSource !== 'sheets');
    document.getElementById('instructions-goodreads').classList.toggle('is-hidden', currentSource !== 'goodreads');
    resetPreview(fileInput);
  });
});

// drop zone / file input

const dropZone  = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

function handleFile(file) {
  if (!file.name.endsWith('.csv')) { alert('el archivo debe ser un .csv'); return; }

  const filenameEl = document.getElementById('drop-filename');
  filenameEl.textContent = file.name;
  show(filenameEl);

  const reader  = new FileReader();
  reader.onload = e => {
    try {
      setParsedBooks(parseCSV(e.target.result, currentSource));
      buildPreview();
    } catch (err) {
      alert(err.message);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

// botón importar otro archivo 
document.getElementById('btn-import-again').addEventListener('click', () => resetPreview(fileInput));

// exporta csv

document.getElementById('btn-export-csv').addEventListener('click', async () => {
  const btn = document.getElementById('btn-export-csv');
  btn.textContent = 'generando...';
  btn.disabled    = true;

  try {
    const books = await getBooks();
    if (!books.length) { alert('no hay libros para exportar'); return; }

    const STATUS = { read: 'Finalizado', reading: 'Leyendo', want_to_read: 'Pendiente' };
    const headers = ['Título','Autor','Páginas','Estado','Inicio','Fin','Reseña'];
    const rows = books.map(b => [
      b.title        ?? '',
      b.author       ?? '',
      b.total_pages  ?? '',
      STATUS[b.status] ?? b.status ?? '',
      b.date_started  ?? '',
      b.date_finished ?? '',
      (b.review ?? '').replace(/"/g, '""'),
    ].map(v => `"${v}"`).join(','));

    const csv  = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `biblioteca-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('error al exportar: ' + err.message);
  } finally {
    btn.textContent = '⬇ exportar CSV';
    btn.disabled    = false;
  }
});