# mi biblioteca

Tracker personal de libros construido con HTML/CSS/JS vanilla y Firebase. Permite registrar libros, seguir el progreso de lectura, ver estadísticas y exportar/importar desde Google Sheets o Goodreads.

Este es un proyecto de uso personal desarrollado como parte de mi aprendizaje en desarrollo web.

---

## Features

- **Biblioteca** — permite agregar libros manualmente o buscando en Open Library, con portada automática
- **Datos** — importar desde Google Sheets CSV o Goodreads CSV, exportar tu biblioteca como CSV
- **Estados** — marcar leído, leyendo, pendiente
- **Filtros y búsqueda** — filtrar por estado, buscar por título o autor
- **Progreso** — hacer seguimiento por páginas o porcentaje, con historial de registros
- **Stats** — ver resumen general, libros por mes, histórico anual con gráficos, exportar como imagen


---

## Stack

| Tecnología | Uso |
|---|---|
| HTML / CSS / JS vanilla | Frontend, sin frameworks |
| Firebase Firestore | Base de datos en tiempo real |
| Open Library API | Búsqueda de libros y portadas |
| Google Books API | Fallback para portadas |
| Chart.js | Gráficos de estadísticas |
| html2canvas | Exportar stats como imagen |

---

## Estructura

```
tracker-libros/
├── index.html              # Biblioteca principal
├── stats.html              # Estadísticas
├── import.html             # Importar / exportar datos
├── css/
│   ├── base.css            # Reset y estilos globales
│   ├── layout.css          # Header, footer, marquee, section-title
│   ├── components.css      # Botones, badges, progress, utilidades
│   ├── books.css           # Grid de libros y cards
│   ├── sidebar.css         # Panel lateral desktop
│   ├── modals.css          # Modales agregar y detalle
│   ├── stats.css           # Página de estadísticas
│   └── import.css          # Página de datos
├── js/
│   ├── books.js            # CRUD de libros (Firestore)
│   ├── firebase.js         # Configuración Firebase
│   ├── import.ui.js        # Entry point importar/exportar
│   ├── import.preview.js   # Tabla preview de importación
│   ├── import.importer.js  # Lógica de importación y duplicados
│   ├── import.parser.js    # Parser CSV (Sheets y Goodreads)
│   ├── progress.js         # Historial de progreso
│   ├── stats.js            # Cálculo y guardado de stats
│   ├── stats.ui.js         # Entry point estadísticas
│   ├── stats.mes.js        # Modal este mes
│   ├── stats.historico.js  # Modal histórico + exportar imagen
│   ├── stats.charts.js     # Gráficos Chart.js
│   ├── ui.js               # Entry point principal
│   ├── ui.books.js         # Grid, filtros, búsqueda
│   ├── ui.modals.js        # Modal agregar + Open Library
│   ├── ui.detail.view.js   # Modal detalle (vista)
│   └── ui.detail.edit.js   # Modal detalle (edición)
└── media/                  # Assets estáticos
```

---

## Correr localmente

Requiere un servidor local porque usa ES modules (`type="module"`). Cualquiera de estas opciones funciona:

```bash
# Con VS Code: instalar extensión Live Server y abrir con Go Live

# Con Python
python -m http.server 5500

# Con Node
npx serve .
```

Después abrir `http://localhost:5500` en el navegador.

### Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Activar Firestore Database
3. Reemplazar la config en `js/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## To-do

- [ ] Autenticación para multi-usuario
- [ ] Modo oscuro
- [ ] Rating con estrellas

---

*Hecha por [martidc](https://github.com/martidc)*