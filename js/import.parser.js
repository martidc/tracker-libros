// parseo de una línea CSV respetando comillas 
export function parseCSVLine(line) {
  const result = [];
  let current  = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// entry point principal 
export function parseCSV(text, source) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('el archivo está vacío o no tiene datos');

  // buscar la fila de headers — puede no ser la primera si hay un título arriba
  const HEADER_HINTS = ['título', 'titulo', 'title', 'book title'];
  const headerIdx = lines.findIndex(l =>
    parseCSVLine(l).map(c => c.toLowerCase().trim()).some(c => HEADER_HINTS.includes(c))
  );
  if (headerIdx === -1) throw new Error('no se encontró encabezado válido — la planilla debe tener una columna "Título"');

  const headers = parseCSVLine(lines[headerIdx]).map(h => h.toLowerCase().trim());
  const rows    = lines.slice(headerIdx + 1);

  const books = source === 'sheets'
    ? parseSheetsCSV(headers, rows)
    : parseGoodreadsCSV(headers, rows);

  if (!books.length) throw new Error('no se encontraron libros válidos en el archivo');
  return books;
}

// parser google sheets

const SHEETS_COLS = {
  titulo:  ['título', 'titulo', 'title'],
  autor:   ['autor', 'autora', 'author', 'autor/a'],
  paginas: ['páginas', 'paginas', 'pages', 'págs', 'pags'],
  idioma:  ['idioma', 'language', 'lang'],
  inicio:  ['inicio', 'fecha inicio', 'start', 'date started', 'fecha_inicio'],
  fin:     ['finalización', 'finalizacion', 'fin', 'fecha fin', 'end', 'date finished', 'fecha_fin'],
  formato: ['formato', 'format'],
  estado:  ['estado', 'status', 'state'],
};

function makeColFinder(headers, map) {
  return name => {
    for (const v of (map[name] || [name])) {
      const idx = headers.indexOf(v);
      if (idx !== -1) return idx;
    }
    return -1;
  };
}

function parseSheetsCSV(headers, lines) {
  const col   = makeColFinder(headers, SHEETS_COLS);
  const books = [];

  for (const line of lines) {
    const cells = parseCSVLine(line);
    if (cells.every(c => !c)) continue;

    const titulo = cells[col('titulo')]?.trim();
    if (!titulo) continue;

    books.push({
      title:         titulo,
      author:        cells[col('autor')]?.trim()      || '',
      total_pages:   parseInt(cells[col('paginas')])  || null,
      language:      cells[col('idioma')]?.trim()     || null,
      date_started:  parseDate(cells[col('inicio')]?.trim()),
      date_finished: parseDate(cells[col('fin')]?.trim()),
      format:        cells[col('formato')]?.trim()    || null,
      status:        mapStatusSheets(cells[col('estado')]?.trim()),
    });
  }
  return books;
}

// parser goodreads

function parseGoodreadsCSV(headers, lines) {
  const col   = name => headers.indexOf(name);
  const books = [];

  for (const line of lines) {
    const cells = parseCSVLine(line);
    if (cells.every(c => !c)) continue;

    const title = cells[col('title')]?.trim();
    if (!title) continue;

    const dateRead = cells[col('date read')]?.trim()  || cells[col('date_read')]?.trim();
    const shelf    = cells[col('exclusive shelf')]?.trim() || cells[col('bookshelves')]?.trim();
    const pages    = parseInt(cells[col('number of pages')] || cells[col('num pages')] || '');

    books.push({
      title,
      author:         cells[col('author')]?.trim() || cells[col('author l-f')]?.trim() || '',
      total_pages:    isNaN(pages) ? null : pages,
      language:       null,
      date_started:   null,
      date_finished:  parseDate(dateRead),
      format:         null,
      status:         mapStatusGoodreads(shelf),
      published_year: parseInt(cells[col('year published')] || cells[col('original publication year')] || '') || null,
      review:         cells[col('my review')]?.trim() || '',
    });
  }
  return books;
}

// helpers

function mapStatusSheets(raw) {
  if (!raw) return 'want_to_read';
  const s = raw.toLowerCase();
  if (s.includes('finaliz') || s.includes('leído') || s.includes('leido') || s.includes('read')) return 'read';
  if (s.includes('leyendo') || s.includes('reading') || s.includes('curso')) return 'reading';
  return 'want_to_read';
}

function mapStatusGoodreads(shelf) {
  if (!shelf) return 'want_to_read';
  const s = shelf.toLowerCase();
  if (s === 'read') return 'read';
  if (s === 'currently-reading' || s === 'reading') return 'reading';
  return 'want_to_read';
}

// acepta: YYYY-MM-DD, DD/MM/YYYY, M/D/YYYY (Goodreads)
function parseDate(str) {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parts = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (parts) {
    const [, a, b, y] = parts;
    const [d, m] = parseInt(a) > 12 ? [a, b] : [b, a];
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}