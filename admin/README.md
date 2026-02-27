# Admin Panel

Local-only admin panel for managing the portfolio's `projects.json` and `config.json`.

## Usage

From the **project root** directory, start a local server:

```bash
npx serve .
```

Then open: `http://localhost:3000/admin/`

> The admin panel loads existing JSON files from `../data/` via relative `fetch()` calls.
> This only works when served over HTTP — not when opened as a `file://` URL.

## Tabs

| Tab | Description |
|---|---|
| **Projects** | List, add, edit, hide and reorder projects. Export `projects.json` |
| **Tags** | Add/edit tags and their translations (CA/ES/EN). Changes are saved when exporting |
| **Appearance** | Configure colors, fonts, header, footer. Export `config.json` |
| **JSON Raw** | Directly edit the raw JSON of either file and export |

## Workflow

1. Make changes in the admin panel
2. Click **Export JSON** to download the updated file
3. Replace the corresponding file in the repository (`data/projects.json` or `data/config.json`)
4. `git add . && git commit -m "..." && git push`
5. GitHub Actions deploys automatically

## Notes

- The admin panel **never saves to disk automatically** — all persistence is via the export/download buttons
- Changes are **in-memory only** until exported
- The panel does not require any backend or authentication
- For security, do not expose the admin panel publicly (it is purely a local dev tool)
