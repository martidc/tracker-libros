# ★ mi biblioteca

Tracker personal de libros construido con HTML/CSS/JS vanilla y Firebase. Permite registrar libros, seguir el progreso de lectura, ver estadísticas y exportar/importar desde Google Sheets o Goodreads.

Este es un proyecto de uso personal desarrollado como parte de mi aprendizaje en desarrollo web.

---

## Features

- **Biblioteca** — permite agregar libros manualmente o buscando en Open Library, con portada automática
- **Datos** — importar desde Google Sheets CSV o Goodreads CSV, exportar la biblioteca como CSV
- **Estados** — leído, leyendo, pendiente
- **Filtros y búsqueda** — filtrá por estado, buscá por título o autor
- **Progreso** — seguimiento por páginas o porcentaje, con historial de registros
- **Stats** — resumen general, libros por mes, histórico anual con gráficos, exportar como imagen
- **Auth** — login con Google, datos protegidos por Firestore Security Rules

---

## Stack

| Tecnología | Uso |
|---|---|
| HTML / CSS / JS vanilla | Frontend, sin frameworks |
| Firebase Firestore | Base de datos en tiempo real |
| Firebase Auth | Autenticación con Google |
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
├── manifest.json           # Config PWA
├── service-worker.js       # Cache offline PWA
├── css/
│   ├── base.css            # Reset y estilos globales
│   ├── layout.css          # Header, footer, marquee, login screen
│   ├── components.css      # Botones, badges, progress, utilidades
│   ├── books.css           # Grid de libros y cards
│   ├── sidebar.css         # Panel lateral desktop
│   ├── modals.css          # Modales agregar y detalle
│   ├── stats.css           # Página de estadísticas
│   └── import.css          # Página de datos
├── js/
│   ├── firebase.js         # Configuración Firebase + Auth
│   ├── auth.js             # Lógica de sesión
│   ├── auth.ui.js          # Login/logout para stats e import
│   ├── books.js            # CRUD de libros (Firestore)
│   ├── progress.js         # Historial de progreso
│   ├── stats.js            # Cálculo y guardado de stats
│   ├── ui.js               # Entry point principal
│   ├── ui.books.js         # Grid, filtros, búsqueda
│   ├── ui.modals.js        # Modal agregar + Open Library
│   ├── ui.detail.view.js   # Modal detalle (vista)
│   ├── ui.detail.edit.js   # Modal detalle (edición)
│   ├── stats.ui.js         # Entry point estadísticas
│   ├── stats.mes.js        # Modal este mes
│   ├── stats.historico.js  # Modal histórico + exportar imagen
│   ├── stats.charts.js     # Gráficos Chart.js
│   ├── import.ui.js        # Entry point importar/exportar
│   ├── import.preview.js   # Tabla preview de importación
│   ├── import.importer.js  # Lógica de importación y duplicados
│   └── import.parser.js    # Parser CSV (Sheets y Goodreads)
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

Después abrí `http://localhost:5500` en el navegador.

### Configurar Firebase

1. Creá un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Activá **Firestore Database** y **Authentication → Google**
3. Reemplazá la config en `js/firebase.js`
4. En **Authentication → Settings → Authorized domains** agregá tu dominio
5. Configurá las Firestore Security Rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == "tu-uid";
    }
  }
}
```

---

## Importar libros

### Desde Google Sheets
Exportá tu planilla como CSV (Archivo → Descargar → CSV). La planilla debe tener columnas con alguno de estos nombres:

`Título` · `Autor` · `Páginas` · `Idioma` · `Inicio` · `Finalización` · `Estado`

El parser detecta los headers automáticamente aunque haya filas de título arriba.

### Desde Goodreads
Exportá desde Goodreads (Mi perfil → Configuración → Importar y exportar → Exportar biblioteca) y subí el CSV directamente.

---

## To-do

- [ ] Modo oscuro
- [ ] Rating con estrellas
- [ ] Rating con estrellas
- [ ] Buscador automático de tapas
- [ ] Agregar opción de libro no terminado.

---

*Hecha por [martidc](https://github.com/martidc)*