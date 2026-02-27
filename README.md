# Portfolio

Personal portfolio to showcase small web projects, apps and MVPs — hosted on GitHub Pages, available [here](https://aaronfortuno.github.io/portfolio/).

## Features

- **Zero build step** — pure HTML5, CSS3, Vanilla JS, no frameworks, no npm
- **Dark mode by default** with light mode toggle; green accent palette
- **Multilingual UI** — Catalan (default), Spanish, English
- **Adaptive card grid** — responsive layout for mobile, tablet and desktop
- **Image carousel** in cards, mosaic view in detail modal
- **Markdown support** in full project descriptions (via bundled `marked.js`)
- **Tag filters** — click to filter projects by tag or project language
- **Language filter** — filter by the language(s) a project is available in, including a language-agnostic option
- **Chronological order** — newest projects first; featured projects float to top
- **Detail modal** — full description, image mosaic with lightbox, links to GitHub / demo / docs
- **Local admin panel** — `admin/index.html` to add/edit projects and configure appearance, exports JSON
- **GitHub Actions** — automatic deployment to GitHub Pages on push to `main`
- **No external services** — everything self-contained in the repository

## Repository structure

```
portfolio/
├── index.html            # Main page
├── assets/
│   ├── css/              # Themes, layout, components
│   ├── js/               # i18n, theme, renderer, carousel, filters, modal
│   └── img/              # favicon, placeholder
├── i18n/                 # UI translation files (ca.json, es.json, en.json)
├── data/
│   ├── projects.json     # Project data
│   └── config.json       # Appearance and site configuration
├── projects/             # Per-project image folders
│   └── <project-id>/img/
├── admin/                # Local admin panel
├── .github/workflows/    # GitHub Pages deployment
├── LICENSE               # GNU GPL v3
└── README.md
```

## Adding a new project

### Option A — Edit JSON manually

1. Create the project media folder:
   ```bash
   mkdir -p projects/my-project/img
   ```
2. Copy screenshots (`.webp` recommended for size):
   ```bash
   cp ~/screenshots/*.webp projects/my-project/img/
   ```
3. Add an entry to `data/projects.json`:
   ```json
   {
     "id": "my-project",
     "visible": true,
     "featured": false,
     "date": "2025-12-01",
     "projectLanguages": ["ca", "es"],
     "title": { "ca": "El meu projecte", "es": "Mi proyecto", "en": "My project" },
     "shortDescription": { "ca": "...", "es": "...", "en": "..." },
     "fullDescription": { "ca": "# Markdown...", "es": "# Markdown...", "en": "# Markdown..." },
     "tags": ["web", "experiment"],
     "images": ["projects/my-project/img/screenshot-01.webp"],
     "links": { "github": "https://github.com/user/my-project", "demo": null, "docs": null }
   }
   ```
4. Commit and push:
   ```bash
   git add .
   git commit -m "feat: add my-project"
   git push
   ```
   GitHub Actions deploys automatically.

### Option B — Use the admin panel

1. Start a local server from the project root:
   ```bash
   npx serve .
   ```
2. Open `http://localhost:3000/admin/` in your browser
3. Use the **Projects** tab to add/edit projects
4. Click **Export JSON** → replace `data/projects.json` in the repo
5. Commit and push

## Configuration

Edit `data/config.json` to set your name, GitHub username, default language, theme, accent color, fonts, and header/footer text. You can also use the **Appearance** tab in the admin panel and export the config.

## Running locally

No build required. Simply serve the directory:

```bash
# Node.js (npx)
npx serve .

# Python 3
python -m http.server 3000

# Then open http://localhost:3000
```

> **Note:** Do not open `index.html` directly as a `file://` URL — `fetch()` calls for the JSON data files require an HTTP server.

## Deployment (GitHub Pages)

1. Push the repository to GitHub
2. Go to **Settings → Pages → Source** and select **GitHub Actions**
3. The included workflow (`.github/workflows/pages.yml`) deploys on every push to `main`

## Project language field

The `projectLanguages` array in each project entry controls which languages that project is available in:

| Value | Meaning |
|---|---|
| `"ca"` | Available in Catalan |
| `"es"` | Available in Spanish |
| `"en"` | Available in English |
| `"agnostic"` | Visual/tool project, no specific language |

## License

This portfolio template is licensed under the **GNU General Public License v3.0**.
See [LICENSE](LICENSE) for details.
