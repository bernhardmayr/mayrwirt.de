const cache = {};
let currentLang = localStorage.getItem('mayrwirt-lang') || 'de';

const menuUrls       = { de: 'Karte/de.html', en: 'Karte/en.html', it: 'Karte/it.html', hu: 'Karte/hu.html', cs: 'Karte/cs.html', es: 'Karte/es.html', fr: 'Karte/fr.html', pl: 'Karte/pl.html', hr: 'Karte/hr.html', uk: 'Karte/uk.html', sk: 'Karte/sk.html', nl: 'Karte/nl.html' };
const tageskarteUrls = { de: 'Tageskarte/de.html', en: 'Tageskarte/en.html', it: 'Tageskarte/it.html', hu: 'Tageskarte/hu.html', cs: 'Tageskarte/cs.html', es: 'Tageskarte/es.html', fr: 'Tageskarte/fr.html', pl: 'Tageskarte/pl.html', hr: 'Tageskarte/hr.html', uk: 'Tageskarte/uk.html', sk: 'Tageskarte/sk.html', nl: 'Tageskarte/nl.html' };
const activitiesUrls = { de: 'ausflugsziele/index.html', en: 'ausflugsziele/en.html', it: 'ausflugsziele/it.html', hu: 'ausflugsziele/hu.html', cs: 'ausflugsziele/cs.html', es: 'ausflugsziele/es.html', fr: 'ausflugsziele/fr.html', pl: 'ausflugsziele/pl.html', hr: 'ausflugsziele/hr.html', uk: 'ausflugsziele/uk.html', sk: 'ausflugsziele/sk.html', nl: 'ausflugsziele/nl.html' };
const jobsUrls       = { de: 'jobboerse/index.html', en: 'jobboerse/en.html', it: 'jobboerse/it.html', hu: 'jobboerse/hu.html', cs: 'jobboerse/cs.html', es: 'jobboerse/es.html', fr: 'jobboerse/fr.html', pl: 'jobboerse/pl.html', hr: 'jobboerse/hr.html', uk: 'jobboerse/uk.html', sk: 'jobboerse/sk.html', nl: 'jobboerse/nl.html' };
const langFlags = { de: '🇩🇪', en: '🇬🇧', it: '🇮🇹', hu: '🇭🇺', cs: '🇨🇿', es: '🇪🇸', fr: '🇫🇷', pl: '🇵🇱', hr: '🇭🇷', uk: '🇺🇦', sk: '🇸🇰', nl: '🇳🇱' };
const langCodes = { de: 'DE',  en: 'EN',  it: 'IT',  hu: 'HU',  cs: 'CS',  es: 'ES',  fr: 'FR',  pl: 'PL',  hr: 'HR',  uk: 'UK',  sk: 'SK',  nl: 'NL'  };

async function loadLocale(lang) {
    if (!cache[lang]) {
        const res = await fetch(`locales/${lang}.json`);
        cache[lang] = await res.json();
    }
    return cache[lang];
}

async function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('mayrwirt-lang', lang);
    const t = await loadLocale(lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.innerHTML = t[key];
    });
    // Update dropdown trigger
    const flagEl = document.getElementById('lang-flag');
    const codeEl = document.getElementById('lang-code');
    if (flagEl) flagEl.textContent = langFlags[lang] || langFlags.de;
    if (codeEl) codeEl.textContent = langCodes[lang] || langCodes.de;
    // Mark active option
    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    const link = document.getElementById('menu-link');
    if (link) link.href = menuUrls[lang] || menuUrls.de;
    const tLink = document.getElementById('tageskarte-link');
    if (tLink) tLink.href = tageskarteUrls[lang] || tageskarteUrls.de;
    document.querySelectorAll('[data-activities-link]').forEach(a => {
        const base   = activitiesUrls[lang] || activitiesUrls.de;
        const filter = a.dataset.filter;
        a.href = base + (filter ? '#' + filter : '');
    });
    document.querySelectorAll('[data-jobs-link]').forEach(a => {
        a.href = jobsUrls[lang] || jobsUrls.de;
    });
}

document.addEventListener('DOMContentLoaded', () => setLang(currentLang));
