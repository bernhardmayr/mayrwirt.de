// ---- Header scroll effect ----
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ---- Mobile menu ----
const menuBtn    = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const iconOpen   = document.getElementById('icon-open');
const iconClose  = document.getElementById('icon-close');

menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('hidden');
    iconOpen.classList.toggle('hidden', !open);
    iconClose.classList.toggle('hidden', open);
});

document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
    });
});

// ---- Scroll fade-in ----
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ---- Chat ----
function toggleChat() {
    const win       = document.getElementById('chat-window');
    const btnOpen   = document.getElementById('chat-open');
    const btnClose  = document.getElementById('chat-close');
    const hidden    = win.classList.toggle('hidden');
    btnOpen.classList.toggle('hidden', !hidden);
    btnClose.classList.toggle('hidden', hidden);
    if (!hidden) document.getElementById('chat-input').focus();
}

function handleChatKey(e) { if (e.key === 'Enter') sendChat(); }

function sendChat() {
    const input    = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    const text     = input.value.trim();
    if (!text) return;

    messages.innerHTML += `<div class="chat-bubble-user"><div>${escHtml(text)}</div></div>`;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
        messages.innerHTML += `<div class="chat-bubble-bot">${getReply(text)}</div>`;
        messages.scrollTop = messages.scrollHeight;
    }, 550);
}

function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getReply(text) {
    const t   = text.toLowerCase();
    const tel = '<a href="tel:+4986546903900" class="font-semibold text-green-800">+49 8654 69 03 90</a>';
    const mail= '<a href="mailto:office@mayrwirt.com" class="font-semibold text-green-800">office@mayrwirt.com</a>';

    if (/reservier|tisch|buchen|book|reserv|prenotar/.test(t))
        return `Für Reservierungen erreichen Sie uns unter ${tel} oder per ${mail}.`;
    if (/zimmer|übernacht|schlaf|room|camera/.test(t))
        return `Wir bieten gemütliche Zimmer mit Frühstück. Bitte kontaktieren Sie uns: ${tel}.`;
    if (/öffnung|uhrzeit|wann|open|orari/.test(t))
        return 'Wirtshaus: Mo–Do 11–14 &amp; 17–22 Uhr, Fr–Sa 11–14 &amp; 17–23 Uhr, So 10–21 Uhr.<br>Metzgerei: Mo–Fr 7–12 &amp; 14–18 Uhr, Sa 7–12 Uhr.';
    if (/speise|karte|menü|menu|essen|food/.test(t))
        return 'Unsere Speisekarte finden Sie als <a href="Karte/Karte.pdf" target="_blank" class="font-semibold text-green-800">PDF</a>.';
    if (/anfahrt|adresse|wo|address|where/.test(t))
        return 'Wir sind in der Untere Str. 24, 83416 Saaldorf — zwischen Salzburg und Freilassing.';
    if (/preis|kosten|price|prezzo/.test(t))
        return `Für Preisinformationen kontaktieren Sie uns bitte direkt: ${tel}.`;
    if (/frühstück|breakfast|colazione/.test(t))
        return 'Frühstück ist in der Zimmermiete inklusive — mit hausgemachten Produkten aus unserer Metzgerei.';
    if (/metzgerei|wurst|fleisch|butcher|macelleria/.test(t))
        return 'Unsere Metzgerei ist Mo–Fr 7–18 Uhr und Sa 7–12 Uhr geöffnet. Aktuelle Angebote: <a href="Karte/Angebot.pdf" target="_blank" class="font-semibold text-green-800">PDF</a>.';
    if (/salzburg|berchtesgaden|ausflug/.test(t))
        return 'Salzburg ist ca. 20 km entfernt, Berchtesgaden ca. 30 km — ideal für Tagesausflüge!';

    return `Vielen Dank für Ihre Frage! Für genaue Auskünfte: ${tel} oder ${mail}.`;
}
