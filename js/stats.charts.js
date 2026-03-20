export const MESES  = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const PINK   = '#ff8fab', PINK_D = '#a0005a';
const GREEN  = '#81c784', GREEN_D = '#2e7d32';
const BLUE   = '#90caf9', BLUE_D  = '#1565c0';

Chart.defaults.font.family = "'VT323', monospace";
Chart.defaults.font.size   = 14;
Chart.defaults.color       = '#7a3b5e';

const barOpts = gridColor => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: gridColor }, ticks: { stepSize: 1 } },
    x: { grid: { display: false } }
  }
});

// instancias de charts (para poder destruirlas antes de recrear)
let chartMesSemanas = null;
let chartHistMonth  = null;
let chartHistPages  = null;
let chartHistYearB  = null;
let chartHistYearP  = null;

// chart: páginas por semana del mes
export function renderChartMesSemanas(books, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks       = ['sem 1','sem 2','sem 3','sem 4', daysInMonth > 28 ? 'sem 5' : null].filter(Boolean);
  const pagesByWeek = Array(weeks.length).fill(0);

  books.forEach(b => {
    if (!b.date_finished || !b.total_pages) return;
    const day = new Date(b.date_finished).getDate();
    const wk  = Math.min(Math.floor((day - 1) / 7), weeks.length - 1);
    pagesByWeek[wk] += b.total_pages;
  });

  if (chartMesSemanas) chartMesSemanas.destroy();
  chartMesSemanas = new Chart(document.getElementById('chart-mes-semanas'), {
    type: 'bar',
    data: { labels: weeks, datasets: [{ data: pagesByWeek, backgroundColor: BLUE, borderColor: BLUE_D, borderWidth: 2 }] },
    options: barOpts('#e3f2fd')
  });
}

// charts: libros y páginas por mes (histórico anual)
export function renderChartsHistorico(countByMonth, pagesByMonth) {
  if (chartHistMonth) chartHistMonth.destroy();
  chartHistMonth = new Chart(document.getElementById('chart-hist-month'), {
    type: 'bar',
    data: { labels: MESES, datasets: [{ data: countByMonth, backgroundColor: PINK, borderColor: PINK_D, borderWidth: 2 }] },
    options: barOpts('#ffd6e7')
  });

  if (chartHistPages) chartHistPages.destroy();
  chartHistPages = new Chart(document.getElementById('chart-hist-pages'), {
    type: 'bar',
    data: { labels: MESES, datasets: [{ data: pagesByMonth, backgroundColor: GREEN, borderColor: GREEN_D, borderWidth: 2 }] },
    options: barOpts('#c8e6c9')
  });
}

// charts: libros y páginas por año (all-time)
export function renderChartsAllTime(years, yearMap) {
  if (!years.length) return;

  if (chartHistYearB) chartHistYearB.destroy();
  chartHistYearB = new Chart(document.getElementById('chart-hist-year-books'), {
    type: 'bar',
    data: { labels: years, datasets: [{ data: years.map(y => yearMap[y].count), backgroundColor: PINK, borderColor: PINK_D, borderWidth: 2 }] },
    options: barOpts('#ffd6e7')
  });

  if (chartHistYearP) chartHistYearP.destroy();
  chartHistYearP = new Chart(document.getElementById('chart-hist-year-pages'), {
    type: 'bar',
    data: { labels: years, datasets: [{ data: years.map(y => yearMap[y].pages), backgroundColor: GREEN, borderColor: GREEN_D, borderWidth: 2 }] },
    options: barOpts('#c8e6c9')
  });
}