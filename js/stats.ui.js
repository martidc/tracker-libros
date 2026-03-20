import { getBooks }    from './books.js';
import { setAllBooks } from './stats.mes.js';
import './stats.historico.js';

// cargar y distribuir libros

export async function reloadBooks() {
  const books = await getBooks();
  setAllBooks(books);
  return books;
}


// init + resumen general

async function init() {
  const books = await reloadBooks();
  renderResumenGeneral(books);
}

function renderResumenGeneral(books) {
  const now       = new Date();
  const thisYear  = now.getFullYear();
  const thisMonth = now.getMonth();
  const readAll   = books.filter(b => b.status === 'read');

  document.getElementById('s-total-read').textContent  = readAll.length;
  document.getElementById('s-total-pages').textContent =
    readAll.reduce((s, b) => s + (b.total_pages ?? 0), 0).toLocaleString('es-AR');
  document.getElementById('s-this-year').textContent  =
    readAll.filter(b => b.date_finished && new Date(b.date_finished).getFullYear() === thisYear).length;
  document.getElementById('s-this-month').textContent =
    readAll.filter(b => {
      if (!b.date_finished) return false;
      const d = new Date(b.date_finished);
      return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
    }).length;
}

// init 
init();