import { renderChartsHistorico, renderChartsAllTime } from './stats.charts.js';
import { reloadBooks }                                   from './stats.ui.js';
import { allBooks }                                   from './stats.mes.js';

// listeners

document.getElementById('btn-open-historico').addEventListener('click', async () => {
  await reloadBooks();
  initHistorico();
  document.getElementById('overlay-historico').classList.add('open');
});
document.getElementById('close-historico').addEventListener('click', () =>
  document.getElementById('overlay-historico').classList.remove('open')
);
document.getElementById('overlay-historico').addEventListener('click', e => {
  if (e.target === document.getElementById('overlay-historico'))
    document.getElementById('overlay-historico').classList.remove('open');
});

// histórico

function initHistorico() {
  const readBooks   = allBooks.filter(b => b.status === 'read' && b.date_finished);
  const currentYear = new Date().getFullYear();
  const years       = [...new Set(
    readBooks.map(b => new Date(b.date_finished).getFullYear()).filter(y => !isNaN(y))
  )].sort((a, b) => b - a);
  const allYears    = years.includes(currentYear) ? years : [currentYear, ...years];

  const sel = document.getElementById('year-select');
  sel.innerHTML = '';
  allYears.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    if (y === currentYear) opt.selected = true;
    sel.appendChild(opt);
  });

  sel.addEventListener('change', () => renderHistorico(parseInt(sel.value)));
  renderHistorico(currentYear);
  renderHistoricoAllTime();
}

function renderHistorico(year) {
  const books = allBooks.filter(b =>
    b.status === 'read' && b.date_finished &&
    new Date(b.date_finished).getFullYear() === year
  );

  const countByMonth = Array(12).fill(0);
  const pagesByMonth = Array(12).fill(0);
  books.forEach(b => {
    const m = new Date(b.date_finished).getMonth();
    countByMonth[m]++;
    if (b.total_pages) pagesByMonth[m] += b.total_pages;
  });

  const totalPages = books.reduce((s, b) => s + (b.total_pages ?? 0), 0);
  const longest    = books.reduce((max, b) =>
    (b.total_pages ?? 0) > (max?.total_pages ?? 0) ? b : max, null);

  document.getElementById('hist-read').textContent    = books.length;
  document.getElementById('hist-pages').textContent   = totalPages.toLocaleString('es-AR');
  document.getElementById('hist-avg').textContent     = books.length ? (books.length / 12).toFixed(1) : '0';
  document.getElementById('hist-longest').textContent = longest?.total_pages ?? '—';

  renderChartsHistorico(countByMonth, pagesByMonth);
}

function renderHistoricoAllTime() {
  const yearMap = {};
  allBooks.forEach(b => {
    if (b.status !== 'read' || !b.date_finished) return;
    const y = new Date(b.date_finished).getFullYear();
    if (isNaN(y)) return;
    if (!yearMap[y]) yearMap[y] = { count: 0, pages: 0 };
    yearMap[y].count++;
    yearMap[y].pages += b.total_pages ?? 0;
  });
  renderChartsAllTime(Object.keys(yearMap).sort(), yearMap);
}

// exportar imagen

document.getElementById('btn-export-img').addEventListener('click', async () => {
  const year    = parseInt(document.getElementById('year-select').value);
  const btn     = document.getElementById('btn-export-img');
  const header  = document.querySelector('#overlay-historico .modal-header');
  const yearSel = document.querySelector('#overlay-historico .year-selector');
  const modal   = document.querySelector('#overlay-historico .modal');
  const overlay = document.getElementById('overlay-historico');

  btn.textContent = 'generando...';
  btn.disabled    = true;
  yearSel.style.display = 'none';
  header.style.display  = 'none';

  const fakeHeader = document.createElement('div');
  fakeHeader.style.cssText = 'background:#ffd6e7;border-bottom:2px solid #ff8fab;padding:10px 14px;';
  fakeHeader.innerHTML = `<span style="font-family:'Press Start 2P',monospace;font-size:8px;color:#a0005a;">★ stats ${year} ★</span>`;
  modal.insertBefore(fakeHeader, modal.firstChild);

  const prevModalStyle   = modal.style.cssText;
  const prevOverlayStyle = overlay.style.cssText;
  modal.style.cssText   += ';width:700px;max-width:700px;max-height:none;overflow:visible;';
  overlay.style.overflow = 'visible';

  const restore = () => {
    yearSel.style.display = '';
    header.style.display  = '';
    modal.removeChild(fakeHeader);
    modal.style.cssText   = prevModalStyle;
    overlay.style.cssText = prevOverlayStyle;
    btn.textContent       = 'exportar';
    btn.disabled          = false;
  };

  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  html2canvas(modal, {
    backgroundColor: '#fff8fc',
    scale: 2,
    useCORS: true,
    logging: false,
    allowTaint: true,
    width: 700,
    windowWidth: 1200,
  }).then(canvas => {
    const a = document.createElement('a');
    a.download = `biblioteca-${year}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    restore();
  }).catch(err => {
    console.error('html2canvas error:', err);
    alert('error al generar la imagen');
    restore();
  });
});