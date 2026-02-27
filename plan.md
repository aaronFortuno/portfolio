# Portfolio GitHub Pages — Plan de Arquitectura y Desarrollo

## Stack tecnológico
- **Vanilla HTML5 + CSS3 + JavaScript ES6+** — sin frameworks, sin build step
- GitHub Pages sirve el repo directamente (rama `main` o `gh-pages`)
- Markdown renderizado en cliente con `marked.js` (única dependencia externa, opcional CDN o bundleado)

## Decisiones validadas
- Panel admin: modo local (importar/exportar JSON), sin GitHub API por ahora
- Descripciones completas: soporte Markdown (para reutilizar READMEs de proyectos)
- Filtros por etiquetas: sí, barra de filtros clickable en el grid
- Filtro por idioma del proyecto: `ca`, `es`, `en`, `language-agnostic`
- Ordenación: por fecha descendente (más nuevos primero), proyectos `featured` flotando arriba
- Paleta dark mode: tonos verdes como color de acento
- Licencia: GNU GPL v3

---

## Estructura de archivos

```
portfolio/
│
├── index.html                  # Entrada única (SPA mínima)
│
├── assets/
│   ├── css/
│   │   ├── main.css            # Layout y estructura base
│   │   ├── themes.css          # Variables CSS dark/light + paletas
│   │   └── components.css      # Cards, modal, carousel, tags, filtros
│   ├── js/
│   │   ├── main.js             # Init + orquestador
│   │   ├── i18n.js             # Motor de internacionalización
│   │   ├── renderer.js         # Renderiza cards y grid
│   │   ├── modal.js            # Vista de detalle (mosaic + links)
│   │   ├── carousel.js         # Carrusel de imágenes en card
│   │   ├── theme.js            # Switch dark/light + aplicar config.json
│   │   └── filters.js          # Filtros por tag e idioma
│   └── img/
│       ├── favicon.svg
│       └── placeholder.svg     # Imagen fallback si falta screenshot
│
├── i18n/
│   ├── ca.json                 # Traducciones UI — catalán (default)
│   ├── es.json                 # Traducciones UI — castellano
│   └── en.json                 # Traducciones UI — inglés
│
├── data/
│   ├── projects.json           # ← FUENTE DE DATOS PRINCIPAL
│   └── config.json             # Configuración visual (tipografía, colores, etc.)
│
├── projects/                   # Media de cada proyecto
│   ├── example-project/
│   │   └── img/
│   │       ├── screenshot-01.webp
│   │       └── screenshot-02.webp
│   └── another-project/
│       └── img/
│           └── cover.webp
│
├── admin/                      # Panel admin (uso local)
│   ├── index.html
│   ├── admin.js
│   ├── admin.css
│   └── README.md
│
├── .github/
│   └── workflows/
│       └── pages.yml           # Deploy automático a GitHub Pages
│
├── LICENSE                     # GNU GPL v3
└── README.md
```

---

## Estructura de `data/projects.json`

```json
{
  "projects": [
    {
      "id": "my-first-app",
      "visible": true,
      "featured": false,
      "date": "2025-06-15",
      "projectLanguages": ["ca", "es"],
      "title": {
        "ca": "La meva primera app",
        "es": "Mi primera app",
        "en": "My first app"
      },
      "shortDescription": {
        "ca": "Descripció breu per la card",
        "es": "Descripción breve para la card",
        "en": "Short description for the card"
      },
      "fullDescription": {
        "ca": "# Markdown complet\n\nPot reutilitzar el README del projecte...",
        "es": "# Markdown completo\n\nPuede reutilizar el README del proyecto...",
        "en": "# Full Markdown\n\nCan reuse the project README..."
      },
      "tags": ["experiment", "education"],
      "images": [
        "projects/my-first-app/img/screenshot-01.webp",
        "projects/my-first-app/img/screenshot-02.webp"
      ],
      "links": {
        "github": "https://github.com/user/my-first-app",
        "demo": "https://user.github.io/my-first-app",
        "docs": null
      }
    }
  ],
  "tags": {
    "experiment": {
      "ca": "Experiment",
      "es": "Experimento",
      "en": "Experiment"
    },
    "education": {
      "ca": "Educació",
      "es": "Educación",
      "en": "Education"
    },
    "game": {
      "ca": "Joc",
      "es": "Juego",
      "en": "Game"
    },
    "tool": {
      "ca": "Eina",
      "es": "Herramienta",
      "en": "Tool"
    },
    "mvp": {
      "ca": "MVP",
      "es": "MVP",
      "en": "MVP"
    },
    "web": {
      "ca": "Web",
      "es": "Web",
      "en": "Web"
    }
  }
}
```

### Campo `projectLanguages`
- Array con los idiomas en que está disponible el proyecto: `["ca"]`, `["es", "en"]`, etc.
- Valor especial `"agnostic"` para proyectos independientes de idioma (ej: herramientas visuales, juegos sin texto)
- Usado para el filtro de idioma en el grid

---

## Estructura de `data/config.json`

```json
{
  "site": {
    "author": "Nom Autor",
    "githubUser": "github-username",
    "defaultLang": "ca",
    "defaultTheme": "dark"
  },
  "appearance": {
    "fontHeading": "Inter",
    "fontBody": "Inter",
    "fontMono": "JetBrains Mono",
    "borderRadius": "12px",
    "cardShadow": "0 8px 32px rgba(0,0,0,0.4)",
    "accentColor": "#22c55e",
    "themes": {
      "dark": {
        "bg": "#0a0f0a",
        "surface": "#111811",
        "surfaceHover": "#182018",
        "text": "#e2ece2",
        "textMuted": "#7a9e7a",
        "border": "#1e2e1e"
      },
      "light": {
        "bg": "#f0f7f0",
        "surface": "#ffffff",
        "surfaceHover": "#e8f5e8",
        "text": "#0f1f0f",
        "textMuted": "#4a724a",
        "border": "#c8e0c8"
      }
    }
  },
  "header": {
    "title": { "ca": "Projectes", "es": "Proyectos", "en": "Projects" },
    "subtitle": {
      "ca": "El que vaig creant",
      "es": "Lo que voy creando",
      "en": "Things I build"
    },
    "showAvatar": false,
    "avatarUrl": ""
  },
  "footer": {
    "showLicense": true,
    "showGithubLink": true,
    "customText": { "ca": "", "es": "", "en": "" }
  }
}
```

---

## Archivos i18n de UI (`i18n/ca.json`, etc.)

```json
{
  "nav": {
    "filterAll": "Tots",
    "filterAgnostic": "Sense idioma"
  },
  "filters": {
    "tags": "Etiquetes",
    "languages": "Idioma del projecte",
    "clearAll": "Netejar filtres"
  },
  "card": {
    "viewMore": "Veure més",
    "noImage": "Sense imatge"
  },
  "modal": {
    "close": "Tancar",
    "links": "Enllaços",
    "github": "Codi font",
    "demo": "Demo",
    "docs": "Documentació"
  },
  "theme": {
    "dark": "Mode fosc",
    "light": "Mode clar"
  },
  "lang": {
    "ca": "Català",
    "es": "Castellà",
    "en": "Anglès"
  },
  "projectLang": {
    "available": "Disponible en"
  },
  "empty": {
    "noResults": "Cap projecte coincideix amb els filtres seleccionats"
  }
}
```

---

## GitHub Actions (`pages.yml`)

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## Panel Admin (modo local)

**Funcionalidades:**
- Importar `projects.json` y `config.json` desde disco
- Formulario visual para editar proyectos (añadir, editar, reordenar, ocultar)
- Gestión de tags (añadir, editar traducciones)
- Configuración visual (colores, tipografía, header, footer) con preview en tiempo real
- Exportar JSONs actualizados para reemplazar en el repo
- Vista previa básica del resultado

**No requiere servidor** — se abre `admin/index.html` localmente con un servidor de desarrollo mínimo:
```bash
npx serve .   # desde la raíz del proyecto
# luego abrir http://localhost:3000/admin/
```

---

## Workflow para añadir un proyecto nuevo

```bash
# 1. Crear carpeta del proyecto
mkdir -p projects/nuevo-proyecto/img

# 2. Copiar screenshots (recomendado formato .webp)
cp ruta/screenshots/*.webp projects/nuevo-proyecto/img/

# 3a. Editar data/projects.json manualmente
#   OR
# 3b. Abrir admin (npx serve . → localhost:3000/admin) y usar el formulario
#     → Exportar JSON → reemplazar data/projects.json

# 4. Commit y push
git add .
git commit -m "feat: add nuevo-proyecto"
git push
# → GitHub Actions despliega automáticamente
```

---

## Plan de desarrollo MVP (fases)

### Fase 1 — Estructura base y datos
- [ ] Scaffolding de archivos y carpetas
- [ ] `data/projects.json` con proyectos de ejemplo
- [ ] `data/config.json` con valores por defecto
- [ ] Archivos i18n (`ca.json`, `es.json`, `en.json`)
- [ ] `LICENSE` (GNU GPL v3)

### Fase 2 — Portfolio principal (`index.html`)
- [ ] HTML semántico base con slots para header, grid, footer
- [ ] CSS: variables de tema, dark/light mode, layout responsive
- [ ] `theme.js`: carga `config.json`, aplica variables CSS, switch dark/light
- [ ] `i18n.js`: carga idioma desde config/localStorage, aplica a elementos `data-i18n`
- [ ] `renderer.js`: fetch `projects.json`, renderiza cards en grid
- [ ] `carousel.js`: carrusel de imágenes dentro de cada card
- [ ] `filters.js`: filtros por tag y por idioma del proyecto
- [ ] `modal.js`: overlay de detalle con mosaico de imágenes, MD renderizado, links
- [ ] Responsive: móvil, tablet, desktop

### Fase 3 — Panel admin
- [ ] `admin/index.html` con estructura de tabs
- [ ] Importar/exportar `projects.json`
- [ ] Formulario de proyecto (añadir/editar/eliminar)
- [ ] Importar/exportar `config.json`
- [ ] Formulario de configuración visual con preview
- [ ] Gestión de tags con i18n

### Fase 4 — GitHub Actions + README
- [ ] `.github/workflows/pages.yml`
- [ ] `README.md` completo (características, uso, instalación, añadir proyectos)
- [ ] `admin/README.md`

---

## Dependencias externas
| Lib | Uso | Estrategia |
|---|---|---|
| `marked.js` | Renderizar MD en modal | Bundleado local en `assets/js/vendor/` |

Sin CDN. Sin npm. Sin build. Todo funciona offline y en GitHub Pages.
