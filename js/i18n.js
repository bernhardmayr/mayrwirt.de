const cache = {};
let currentLang = localStorage.getItem('mayrwirt-lang') || 'de';

const menuUrls = { de: 'Karte/de.html', en: 'Karte/en.html', it: 'Karte/it.html' };

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
    ['de', 'en', 'it'].forEach(l => {
        document.querySelectorAll(`#lang-${l}, #lang-${l}-m`).forEach(btn => {
            btn.classList.toggle('active', l === lang);
        });
    });
    const link = document.getElementById('menu-link');
    if (link) link.href = menuUrls[lang] || menuUrls.de;
}

document.addEventListener('DOMContentLoaded', () => setLang(currentLang));
