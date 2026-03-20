const CACHE = 'biblioteca-v1';
const ASSETS = [
  '/tracker-libros/',
  '/tracker-libros/index.html',
  '/tracker-libros/stats.html',
  '/tracker-libros/import.html',
  '/tracker-libros/css/base.css',
  '/tracker-libros/css/layout.css',
  '/tracker-libros/css/components.css',
  '/tracker-libros/css/books.css',
  '/tracker-libros/css/sidebar.css',
  '/tracker-libros/css/modals.css',
  '/tracker-libros/css/stats.css',
  '/tracker-libros/css/import.css',
  '/tracker-libros/js/firebase.js',
  '/tracker-libros/js/auth.js',
  '/tracker-libros/js/auth.ui.js',
  '/tracker-libros/js/books.js',
  '/tracker-libros/js/progress.js',
  '/tracker-libros/js/stats.js',
  '/tracker-libros/js/ui.js',
  '/tracker-libros/js/ui.books.js',
  '/tracker-libros/js/ui.modals.js',
  '/tracker-libros/js/ui.detail.view.js',
  '/tracker-libros/js/ui.detail.edit.js',
  '/tracker-libros/js/stats.ui.js',
  '/tracker-libros/js/stats.mes.js',
  '/tracker-libros/js/stats.historico.js',
  '/tracker-libros/js/stats.charts.js',
  '/tracker-libros/js/import.ui.js',
  '/tracker-libros/js/import.preview.js',
  '/tracker-libros/js/import.importer.js',
  '/tracker-libros/js/import.parser.js',
];

// Instalar — cachear assets estáticos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar — limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first para assets, network first para Firebase
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Firebase y APIs externas — siempre network
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('google') ||
      url.hostname.includes('openlibrary')) {
    return;
  }

  // Assets locales — cache first
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
    ).catch(() => caches.match('/tracker-libros/index.html'))
  );
});