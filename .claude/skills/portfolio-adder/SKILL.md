---
name: portfolio-adder
description: >
  Incorpora un nou projecte al portafoli. Crea l'entrada a projects.json, fa captures de pantalla
  del projecte en execució, les converteix a webp, les desa a projects/{id}/img/ i deixa tot preparat
  per fer commit i push. Utilitza quan l'usuari vulgui afegir un projecte nou al portafoli.
user-invocable: true
argument-hint: <url-del-projecte>
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, WebFetch, WebSearch
---

# Portfolio Adder

Afegeix un nou projecte al portafoli seguint l'estructura i convencions existents.

## Arguments

- `$ARGUMENTS` — URL del projecte desplegat (demo), o bé el nom/id del projecte si no té URL

## Procés complet

### 1. Recollir informació del projecte

A partir de la URL proporcionada a `$ARGUMENTS`:

1. **Visita la URL** amb WebFetch per obtenir el títol i contingut de la pàgina
2. **Dedueix l'ID del projecte** a partir del nom (kebab-case, sense accents). Exemples: `calc-o-matic`, `repte-acceptat`, `polyedges`
3. **Busca el repositori GitHub** associat. L'usuari del GitHub és `aaronFortuno`. Prova `https://github.com/aaronFortuno/{nom-repo}`
4. **Llegeix el README.md** del repositori per obtenir descripció, tecnologies i característiques

Si no es pot obtenir informació automàticament, **pregunta a l'usuari** el que faci falta.

### 2. Demanar confirmació de les dades

Abans de fer cap canvi, mostra a l'usuari un resum amb:

- **ID**: l'identificador del projecte
- **Títol** (ca/es/en)
- **Descripció curta** (ca/es/en)
- **Tags** proposats (dels existents al JSON, o nous si cal)
- **Links**: github, demo, docs
- **Idiomes del projecte** (projectLanguages)

Espera confirmació o correccions de l'usuari abans de continuar.

### 3. Captures de pantalla

Fes **2 captures de pantalla** del projecte en execució utilitzant Puppeteer:

```javascript
// Script de captures — executar amb: node screenshot.mjs <url> <project-id> <output-dir>
import puppeteer from 'puppeteer';

const url = process.argv[2];
const projectId = process.argv[3];
const outputDir = process.argv[4];

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// Captura 1: Vista desktop (1280x800)
await page.setViewport({ width: 1280, height: 800 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000)); // esperar animacions
await page.screenshot({ path: `${outputDir}/${projectId}-01.png`, fullPage: false });

// Captura 2: Vista mòbil o altra secció
await page.setViewport({ width: 390, height: 844 });
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: `${outputDir}/${projectId}-02.png`, fullPage: false });

await browser.close();
```

**Important:**
- Executa l'script amb `node` (crea un fitxer temporal .mjs i elimina'l després)
- Si el projecte té mode fosc, fes les captures en mode fosc (és el tema per defecte del portafoli)
- Si la pàgina necessita interacció per mostrar contingut interessant, fes-ho abans de capturar

### 4. Convertir imatges a WebP

Converteix les captures PNG a WebP amb qualitat 85:

```bash
# Utilitza cwebp si està disponible, sinó sharp via npx
npx --yes sharp-cli --input {id}-01.png --output {id}-01.webp --quality 85
npx --yes sharp-cli --input {id}-02.png --output {id}-02.webp --quality 85
```

Si `sharp-cli` no funciona, prova alternatives:
- `cwebp` directament si està instal·lat
- Un script node amb `sharp`: `npx --yes -p sharp node -e "const sharp = require('sharp'); sharp('input.png').webp({quality:85}).toFile('output.webp')"`
- En últim cas, deixa les imatges en PNG i avisa l'usuari

### 5. Organitzar fitxers

1. Crea el directori: `portfolio/projects/{id}/img/`
2. Mou les imatges webp al directori creat
3. Elimina els PNG temporals i l'script de captures

### 6. Afegir entrada a projects.json

Llegeix `portfolio/data/projects.json` i afegeix la nova entrada al **principi** de l'array `projects` (els projectes més recents van primer).

**Estructura de l'entrada:**

```json
{
  "id": "{project-id}",
  "type": "project",
  "visible": true,
  "featured": false,
  "date": "{data-actual-YYYY-MM-DD}",
  "projectLanguages": ["ca", "es", "en"],
  "title": {
    "ca": "...",
    "es": "...",
    "en": "..."
  },
  "shortDescription": {
    "ca": "...",
    "es": "...",
    "en": "..."
  },
  "fullDescription": {
    "ca": "# Títol\n\nDescripció completa en markdown...",
    "es": "# Título\n\nDescripción completa en markdown...",
    "en": "# Title\n\nFull description in markdown..."
  },
  "tags": ["web", "education"],
  "images": [
    "projects/{id}/img/{id}-01.webp",
    "projects/{id}/img/{id}-02.webp"
  ],
  "links": {
    "github": "https://github.com/aaronFortuno/{repo}",
    "demo": "{url-demo}",
    "docs": null
  }
}
```

**Directrius per al contingut:**
- Les **shortDescription** han de ser d'1-2 frases, concises i descriptives
- Les **fullDescription** han de ser en format Markdown amb seccions: descripció, característiques, tecnologies
- Cada idioma ha de ser una **traducció natural**, no literal
- Els **tags** han de ser dels ja existents al JSON sempre que sigui possible
- La **data** ha de ser la data d'avui

### 7. Verificació final

1. Verifica que el JSON és vàlid: `node -e "JSON.parse(require('fs').readFileSync('portfolio/data/projects.json','utf8'))"`
2. Verifica que les imatges existeixen als paths referenciats
3. Mostra un resum dels canvis fets:
   - Fitxers nous creats
   - Línies afegides a projects.json
   - Paths de les imatges

### 8. Missatge final

Indica a l'usuari que tot està preparat i que pot:
```
git add portfolio/data/projects.json portfolio/projects/{id}/
git commit -m "Add {project-name} to portfolio"
git push
```

## Tags disponibles (referència)

Consulta els tags existents a `projects.json` dins l'objecte `tags` per mantenir coherència. Només crea tags nous si cap dels existents encaixa.

## Convencions importants

- **Idioma de comunicació**: Català (l'idioma preferit de l'usuari)
- **Format d'imatges**: WebP, qualitat 85
- **Nomenclatura imatges**: `{id}-01.webp`, `{id}-02.webp`, etc.
- **ID del projecte**: kebab-case, sense accents, curt i descriptiu
- **Ordre al JSON**: projectes més recents primer
- L'usuari de GitHub és **aaronFortuno**
- Les URLs de demo segueixen el patró: `https://aaronfortuno.github.io/{repo}`
