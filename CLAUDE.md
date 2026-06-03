# CLAUDE.md — Landgasthof Mayrwirt Website

This file gives AI assistants the context needed to work on this codebase correctly.

## Project overview

Static website for **Landgasthof Mayrwirt**, a family-run restaurant, hotel, and butchery in Saaldorf-Surheim, Bavaria, Germany.

- **Live URL**: https://bernhardmayr.github.io/mayrwirt.de/
- **Hosting**: GitHub Pages (auto-deployed on push to `main`)
- **Sections**: Wirtshaus (restaurant), Zimmer (rooms), Metzgerei (butchery), Ausflugsziele (day trips), Jobbörse (jobs)

## Tech stack

| Layer | Choice |
|---|---|
| Markup | HTML5 (semantic, Schema.org JSON-LD) |
| Styling | Tailwind CSS v4 + custom `css/style.css` |
| JavaScript | Vanilla ES6+ (no framework, no bundler) |
| Build tool | `@tailwindcss/cli` (only for CSS compilation) |
| PWA | `manifest.json` + service-worker-ready |
| Deployment | GitHub Actions → GitHub Pages |

There is no React, Vue, Next.js, or any other JS framework.

## Directory layout

```
mayrwirt.de/
├── index.html                  # Main single-page entry point (all sections)
├── manifest.json               # PWA manifest
├── robots.txt / sitemap.xml    # SEO files
├── package.json                # devDeps: tailwindcss, @tailwindcss/cli
├── tailwind.config.js          # Custom colours + fonts
│
├── js/
│   ├── i18n.js                 # Language detection, locale loading, DOM injection
│   └── main.js                 # UI interactions (scroll header, mobile menu, hours status)
│
├── css/
│   ├── style.css               # Custom component styles (compiled output — committed)
│   └── tailwind.css            # Tailwind compiled output (committed)
│   # css/input.css is gitignored (Tailwind source, not in repo)
│
├── locales/                    # Translation JSON files
│   ├── de.json (default)
│   └── en/it/hu/cs/es/fr/pl/hr/uk/sk/nl/bar.json
│
├── Karte/                      # Full menu — one HTML file per language
│   └── de.html en.html it.html … (12 files) + PDFs
│
├── Tageskarte/                 # Daily specials — same structure as Karte/
│
├── ausflugsziele/              # Day-trip guide
│   ├── index.html (de) + 11 language variants
│   ├── activities.json         # 471 KB data file — all attractions with geo/metadata
│   └── activities.js           # Filter UI, search, Google Maps links
│
├── jobboerse/                  # Job board
│   ├── index.html (de) + 11 language variants
│   └── jobboerse.pdf
│
├── impressum-und-datenschutz/  # Legal / privacy pages
├── Preise/                     # Pricing pages
│
├── wp-content/uploads/         # Legacy image asset path (do not rename)
│
└── .github/workflows/
    └── deploy.yml              # GitHub Pages deployment
```

## Development workflow

### Local serving

No dev server is configured. Serve the root directory with any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser. The i18n system uses `fetch()` for locale files, so you need HTTP — opening `index.html` directly via `file://` will fail CORS on locale loading.

### Tailwind CSS

The compiled output `css/tailwind.css` is committed to git. Rebuild it only when adding new Tailwind classes to `index.html`:

```bash
npm install
npx tailwindcss -i css/input.css -o css/tailwind.css
```

**Important**: `css/input.css` (the source) is gitignored — it exists only locally. The config in `tailwind.config.js` scans only `./index.html`. If you add Tailwind classes to sub-pages (Karte/, ausflugsziele/, etc.) they will not be picked up automatically — either add them to `css/style.css` manually or expand the `content` array in `tailwind.config.js`.

## Internationalization (i18n)

### How it works

1. On page load, `js/i18n.js` reads `localStorage.getItem('mayrwirt-lang')` (defaults to `'de'`).
2. It fetches `locales/{lang}.json` (cached in memory after first load).
3. Every DOM element with a `data-i18n="key"` attribute has its `innerHTML` replaced with the translation value.
4. `document.documentElement.lang` is set to the language code.
5. Navigation links to sub-pages (Karte, Tageskarte, Ausflugsziele, Jobbörse) are updated to point to the correct language variant.

### Supported languages

12 language codes used for sub-pages: `de en it hu cs es fr pl hr uk sk nl`

The `bar.json` locale file exists in `locales/` but has no corresponding sub-page HTML variants.

### Adding a translation key

1. Add the key/value to **all** `locales/*.json` files.
2. Add `data-i18n="your-key"` to the HTML element in `index.html`.

### Adding a new language

1. Create `locales/{code}.json` with all keys.
2. Add the language to the URL maps and `langFlags`/`langCodes` objects in `js/i18n.js`.
3. Create language-variant HTML files in each sub-page directory (Karte/, Tageskarte/, ausflugsziele/, jobboerse/).

## Content update patterns

### Menu (Karte/ and Tageskarte/)

Each language has its own static HTML file (e.g. `Karte/de.html`). Update all 12 language files when menu content changes. PDFs are served directly: `Karte/Karte.pdf`, `Karte/Tageskarte.pdf`, `Karte/Angebot.pdf`.

### Activities / day trips

All attraction data lives in `ausflugsziele/activities.json`. The JS in `ausflugsziele/activities.js` reads this file at runtime and builds the filter UI and cards dynamically. Edit the JSON to add/remove/update attractions. Do not add large inline objects — the file is already 471 KB.

Fields in each activities.json entry: `name`, `category`, `season`, `distance`, `lat`, `lng`, `description` (and language variants thereof).

### Translations / locale strings

Edit `locales/{lang}.json` for text changes. All 12 language files must stay in sync — add/remove keys in all files simultaneously.

### Job board

Update the 12 HTML files in `jobboerse/` and replace `jobboerse/jobboerse.pdf` as needed.

### Business hours (open/closed badge)

Business hours logic is in `js/main.js` → `initHoursStatus()`. It computes real-time open/closed status for the restaurant and butchery. Update the hour ranges there when operating hours change.

## Design system

### Colour palette (Tailwind tokens)

| Token | Hex | Usage |
|---|---|---|
| `forest` | `#2D5016` | Primary brand (dark green) |
| `bark` | `#7B3F1C` | Brown accent |
| `gold` | `#C9962C` | Warm highlight |
| `cream` | `#FAF7F2` | Light background |
| `warm` | `#6B6458` | Neutral warm grey |

### Typography

- `font-serif` → Playfair Display (headings, display text)
- `font-sans` → Inter (body, UI elements)

Both loaded from Google Fonts in `index.html`.

## Key conventions

- **No JS framework** — all interactivity is vanilla ES6+. Do not introduce React, Vue, Alpine, etc.
- **No bundler** — scripts are loaded with `<script src="...">` tags. No import maps, no module bundling.
- **File naming for language variants** — use the ISO 639-1 code as the filename: `de.html`, `en.html`, etc. German default uses `index.html` in sub-directories.
- **Assets** — images live under `wp-content/uploads/` (legacy WordPress path). Do not reorganise this without updating all HTML references.
- **Schema.org** — `index.html` contains a `<script type="application/ld+json">` Restaurant schema block. Keep it up to date when contact details or hours change.
- **hreflang** — `index.html` has `<link rel="alternate" hreflang="...">` tags. Update them if the language set changes.
- **No tests** — `npm test` is a placeholder. Verify changes by serving locally and checking visually across a few languages.

## Deployment

Push to `main` → GitHub Actions runs `.github/workflows/deploy.yml` → uploads the entire repo root as a GitHub Pages artifact → live in ~1 minute.

There is **no build step** in CI. The compiled `css/tailwind.css` must be committed before pushing if CSS classes changed.

```
Trigger: push to main (or manual workflow_dispatch)
Runner: ubuntu-latest
Steps: checkout → configure-pages → upload-pages-artifact (path: .) → deploy-pages
```

## Known pitfalls

- **Multilingual duplication** — every content page exists as 12 separate HTML files. A structural change (nav bar, footer, layout) must be applied to all variants. Consider diffing `de.html` against other languages after edits to catch drift.
- **Tailwind scope** — `tailwind.config.js` only scans `index.html`. New utility classes in sub-page HTML files will not be included in the compiled CSS. Add them to `css/style.css` directly or extend the `content` config.
- **activities.json size** — at 471 KB this file is already large. Do not embed base64 images or large text blobs in it.
- **Legacy asset path** — images are under `wp-content/uploads/2015/05/`. This path is referenced throughout all HTML files; rename only with a global search-and-replace.
- **`css/input.css` is not in git** — if you need to rebuild Tailwind from scratch on a fresh clone, recreate `css/input.css` with `@import "tailwindcss";` before running the CLI.
- **`bar.json` locale** — exists in `locales/` but has no sub-page HTML variants and is not listed in `js/i18n.js`'s URL maps. It may be a dialect variant for display-only use in `index.html`.
