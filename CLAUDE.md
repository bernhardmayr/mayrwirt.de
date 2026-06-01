# CLAUDE.md — Mayrwirt Website

## Project overview

Static single-page website for **Mayrwirt**, a traditional Bavarian country inn and butcher shop in Saaldorf, Bavaria (near Salzburg). The site is deployed via GitHub Pages from the `main` branch.

**Live URL:** https://mayrwirt.de (once CNAME is configured)
**Repository:** https://github.com/bernhardmayr/mayrwirt.de

---

## Tech stack

| Layer | Tool |
|---|---|
| Markup | Vanilla HTML (`index.html`) — single page, section-based |
| Styling | Tailwind CSS v4 (locally compiled) + custom `css/style.css` |
| JavaScript | Vanilla JS — no framework, no bundler |
| i18n | Custom translation system in `js/i18n.js` |
| Fonts | Google Fonts: Playfair Display (serif) + Inter (sans) |
| Deployment | GitHub Actions → GitHub Pages (`main` branch push) |
| Package manager | npm (dev-only, for Tailwind CLI) |

---

## File structure

```
mayrwirt.de/
├── index.html              # Entire site — one file, section-based SPA
├── css/
│   ├── tailwind.css        # Compiled Tailwind output — DO NOT edit manually
│   └── style.css           # Custom component styles (appended to tailwind.css)
├── js/
│   ├── i18n.js             # Translations (DE/EN/IT) + language switching logic
│   └── main.js             # Header scroll, mobile menu, chat widget, fade-in
├── Karte/
│   ├── de.html             # Menu in German
│   ├── en.html             # Menu in English
│   ├── it.html             # Menu in Italian
│   ├── Karte.pdf           # Full menu PDF
│   ├── Angebot.pdf         # Butcher shop offers PDF
│   └── Tageskarte.pdf      # Daily specials PDF
├── Preise/
│   └── Preisinformation.pdf
├── wp-content/uploads/     # All images (legacy WordPress path, kept as-is)
├── tailwind.config.js      # Tailwind theme config (colors, fonts)
├── package.json            # npm config — only dev dep is @tailwindcss/cli
└── .github/workflows/
    └── deploy.yml          # GitHub Actions — deploys whole repo root to Pages
```

**Legacy files** (from original WordPress export — do not touch or delete):
- `wp-content/plugins/`, `wp-includes/`, `robots.txt`, `xmlrpc.php?rsd`, `feed/` dirs, `index.html?p=*.html` files

---

## Development workflow

### 1. Compile Tailwind CSS

Tailwind CSS is compiled locally. The output (`css/tailwind.css`) is committed to the repo — GitHub Actions does **not** run a build step.

```bash
# Install dev deps (one-time)
npm install

# Watch mode during development
npx @tailwindcss/cli -i css/input.css -o css/tailwind.css --watch

# One-shot build before committing
npx @tailwindcss/cli -i css/input.css -o css/tailwind.css --minify
```

> `css/input.css` is gitignored (it contains `@import "tailwindcss"` — the source file). The compiled `css/tailwind.css` **is** committed and served directly.

### 2. Preview locally

Open `index.html` directly in a browser. No server required — all assets are relative paths and no server-side processing exists.

### 3. Deploy

Push to `main`. GitHub Actions (`.github/workflows/deploy.yml`) automatically uploads the entire repo root to GitHub Pages. No build step runs in CI.

---

## Tailwind conventions

### Custom color palette (`tailwind.config.js`)

| Token | Hex | Usage |
|---|---|---|
| `forest` | `#2D5016` | Primary green (header bg, section bg, nav) |
| `bark` | `#7B3F1C` | Brown accent |
| `gold` | `#C9962C` | CTA buttons, accent icons |
| `cream` | `#FAF7F2` | Page background |
| `warm` | `#6B6458` | Body text, descriptions |

### Custom font families

- `font-serif` → Playfair Display — headings, section titles, brand name
- `font-sans` → Inter — body text, nav, labels

### Custom CSS classes (defined in `css/style.css`)

| Class | Description |
|---|---|
| `.btn-primary` | Gold filled pill button |
| `.btn-ghost` | Semi-transparent white pill with border |
| `.btn-secondary` | Outlined pill (forest border) |
| `.btn-outline` | Ghost outline variant |
| `.btn-gold` | Gold button for use on dark backgrounds |
| `.nav-link` | Desktop navigation anchor |
| `.mobile-link` | Mobile menu anchor |
| `.lang-btn` | Language switcher button (`active` modifier via JS) |
| `.label-tag` | Small uppercase section label (forest text) |
| `.label-tag-light` | Same but for dark section backgrounds |
| `.section-title` | Large serif section heading |
| `.fade-in` | Scroll-triggered fade-in (activated via IntersectionObserver in `main.js`) |
| `.img-card` | Rounded image card with overflow-hidden |
| `.feature-item` | Amenity checklist item with checkmark |
| `.area-card` | Location card (cream bg, rounded) |
| `.chat-bubble-user` / `.chat-bubble-bot` | Chat widget message bubbles |

---

## Internationalisation (i18n)

All user-visible text in `index.html` uses `data-i18n="key"` attributes. Never hardcode translated strings directly in `index.html` — always add them to all three locales in `js/i18n.js`.

**Three locales:** `de` (default), `en`, `it`

**How it works:**
1. `applyTranslations()` in `i18n.js` reads `currentLang` and sets `el.innerHTML` for every `[data-i18n]` element.
2. `setLang(lang)` updates `localStorage` (`mayrwirt-lang`) and re-applies.
3. Language persists across page reloads via `localStorage`.
4. The menu link (`#menu-link`) switches between `Karte/de.html`, `Karte/en.html`, `Karte/it.html`.

**Adding a translation key:**
1. Add the key to all three locale objects in `js/i18n.js`.
2. Add `data-i18n="your.key"` to the HTML element.
3. The German (`de`) text can remain as the initial `innerHTML` fallback.

---

## Page sections (in order)

| Section ID | Description |
|---|---|
| `#home` | Full-viewport hero with background image and CTA buttons |
| *(no id)* | Highlights strip — 4-icon summary bar (forest bg) |
| `#wirtshaus` | Restaurant section — description, opening hours, menu link |
| `#zimmer` | Rooms section — photo grid, amenities, breakfast card |
| `#metzgerei` | Butcher shop — dark section (forest bg), hours, offers PDF |
| `#umgebung` | Area / surroundings — attraction cards |
| `#aktiv-sein` | *(referenced in old WP pages)* — activities |
| `#kontakt` | Contact section — address, phone, contact form |
| `#footer` | Footer with opening hours summary and links |

Navigation links (`#wirtshaus`, `#zimmer`, etc.) use smooth scroll via `html { scroll-behavior: smooth }`.

---

## JavaScript modules

### `js/main.js`
- **Header scroll effect** — adds `.scrolled` class to `#header` after 60 px scroll (triggers opaque forest background)
- **Mobile menu** — toggles `#mobile-menu` and swaps hamburger/X icons
- **Scroll fade-in** — `IntersectionObserver` adds `.visible` to `.fade-in` elements at 12% threshold
- **Chat widget** — `toggleChat()`, `sendChat()`, `getReply()`, `handleChatKey()` — rule-based keyword bot (no backend)

### `js/i18n.js`
- Translation dictionary for DE/EN/IT
- `setLang()` / `applyTranslations()` / `updateLangBtns()` / `updateMenuLink()`
- Runs on `DOMContentLoaded`

---

## Chat widget

The embedded chat widget is entirely client-side and rule-based (no API calls). Keyword matching in `getReply()` covers: reservations, rooms, opening hours, menu, address, prices, breakfast, butcher shop, nearby attractions. All other inputs get a generic "please call us" reply.

Phone: `+49 8654 69 03 90` | Email: `office@mayrwirt.com`

---

## Images

All images live under `wp-content/uploads/2015/` (legacy WordPress path). Key files:

| File | Used in |
|---|---|
| `Mayrwirt.png` | Logo in header |
| `FavIcon_16x16.png` | Favicon |
| `mayrwirt-hausansicht-abends.jpg` | Hero background |
| `Impression_Restaurant.jpg`, `MW_Restaurant_04/05.jpg` | Wirtshaus section |
| `Mayrwirt_Zimmer_01–03.jpg`, `Mayrwirt_Bad_01.jpg` | Zimmer section |
| `Frühstück_01.jpg` | Breakfast card |
| `Mayrwirt_Metzgerei_Hauptbild.jpg` | Metzgerei section |

---

## Deployment pipeline

```
git push origin main
  └─> GitHub Actions: deploy.yml
        └─> actions/checkout@v4
        └─> actions/configure-pages@v5
        └─> actions/upload-pages-artifact@v3  (uploads repo root)
        └─> actions/deploy-pages@v4
```

There is **no build step in CI**. Compiled CSS (`css/tailwind.css`) must be committed before pushing.

---

## Key conventions

- **One HTML file** — `index.html` is the entire site. Keep all sections in it.
- **Commit compiled CSS** — `css/tailwind.css` is the build artifact; always regenerate and commit it after Tailwind source changes.
- **No inline styles** — use Tailwind utility classes or custom classes from `style.css`.
- **No translation in HTML** — all user-facing strings go through `data-i18n` and `js/i18n.js`. Provide all three locales.
- **No JS framework** — stay vanilla. No npm runtime dependencies.
- **Legacy directories are read-only** — `wp-content/`, `wp-includes/`, `feed/` dirs, `*.html?p=*` files are from the original WordPress export and should not be modified.
- **Chat bot is offline-only** — `getReply()` in `main.js` is purely regex-based; do not add network calls without discussing backend infrastructure first.
