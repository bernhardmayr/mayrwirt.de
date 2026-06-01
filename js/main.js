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
    const lang = localStorage.getItem('mayrwirt-lang') || 'de';
    const t    = text.toLowerCase();
    const tel  = '<a href="tel:+4986546903900" class="font-semibold text-green-800">+49 8654 69 03 90</a>';
    const mail = '<a href="mailto:office@mayrwirt.com" class="font-semibold text-green-800">office@mayrwirt.com</a>';
    const pdf  = `<a href="Karte/Karte.pdf" target="_blank" class="font-semibold text-green-800">PDF</a>`;
    const offer= `<a href="Karte/Angebot.pdf" target="_blank" class="font-semibold text-green-800">PDF</a>`;

    const r = {
        de: {
            reservation: `Für Reservierungen erreichen Sie uns unter ${tel} oder per ${mail}.`,
            rooms:        `Wir bieten gemütliche Zimmer mit Frühstück. Bitte kontaktieren Sie uns: ${tel}.`,
            hours:        'Wirtshaus: Mo–Do 11–14 &amp; 17–22 Uhr, Fr–Sa 11–14 &amp; 17–23 Uhr, So 10–21 Uhr.<br>Metzgerei: Mo–Fr 7–12 &amp; 14–18 Uhr, Sa 7–12 Uhr.',
            menu:         `Unsere Speisekarte finden Sie als ${pdf}.`,
            address:      'Wir sind in der Untere Str. 24, 83416 Saaldorf — zwischen Salzburg und Freilassing.',
            price:        `Für Preisinformationen kontaktieren Sie uns bitte direkt: ${tel}.`,
            breakfast:    'Frühstück ist in der Zimmermiete inklusive — mit hausgemachten Produkten aus unserer Metzgerei.',
            butcher:      `Unsere Metzgerei ist Mo–Fr 7–18 Uhr und Sa 7–12 Uhr geöffnet. Aktuelle Angebote: ${offer}.`,
            area:         'Salzburg ist ca. 20 km entfernt, Berchtesgaden ca. 30 km — ideal für Tagesausflüge!',
            fallback:     `Vielen Dank für Ihre Frage! Für genaue Auskünfte: ${tel} oder ${mail}.`,
        },
        en: {
            reservation: `For reservations please contact us at ${tel} or ${mail}.`,
            rooms:        `We offer cosy rooms with breakfast included. Please contact us: ${tel}.`,
            hours:        'Restaurant: Mon–Thu 11am–2pm &amp; 5–10pm, Fri–Sat 11am–2pm &amp; 5–11pm, Sun 10am–9pm.<br>Butcher: Mon–Fri 7am–12pm &amp; 2–6pm, Sat 7am–12pm.',
            menu:         `You can find our menu as a ${pdf}.`,
            address:      'We are located at Untere Str. 24, 83416 Saaldorf — between Salzburg and Freilassing.',
            price:        `For price information please contact us directly: ${tel}.`,
            breakfast:    'Breakfast is included in the room rate — with home-made products from our own butcher's shop.',
            butcher:      `Our butcher's shop is open Mon–Fri 7am–6pm and Sat 7am–12pm. Current offers: ${offer}.`,
            area:         'Salzburg is approx. 20 km away, Berchtesgaden approx. 30 km — perfect for day trips!',
            fallback:     `Thank you for your question! For detailed information: ${tel} or ${mail}.`,
        },
        it: {
            reservation: `Per prenotazioni ci può contattare al ${tel} o via ${mail}.`,
            rooms:        `Offriamo camere accoglienti con colazione inclusa. Contattateci: ${tel}.`,
            hours:        'Ristorante: Lun–Gio 11–14 &amp; 17–22, Ven–Sab 11–14 &amp; 17–23, Dom 10–21.<br>Macelleria: Lun–Ven 7–12 &amp; 14–18, Sab 7–12.',
            menu:         `Il nostro menù è disponibile come ${pdf}.`,
            address:      'Siamo a Untere Str. 24, 83416 Saaldorf — tra Salisburgo e Freilassing.',
            price:        `Per informazioni sui prezzi contattateci direttamente: ${tel}.`,
            breakfast:    'La colazione è inclusa nel prezzo della camera — con prodotti artigianali della nostra macelleria.',
            butcher:      `La nostra macelleria è aperta Lun–Ven 7–18 e Sab 7–12. Offerte: ${offer}.`,
            area:         'Salisburgo è a circa 20 km, Berchtesgaden a circa 30 km — ideale per gite!',
            fallback:     `Grazie per la domanda! Per informazioni: ${tel} o ${mail}.`,
        },
        hu: {
            reservation: `Foglaláshoz hívjon minket: ${tel} vagy írjon: ${mail}.`,
            rooms:        `Reggelivel ellátott, hangulatos szobákat kínálunk. Kérjük, vegye fel velünk a kapcsolatot: ${tel}.`,
            hours:        'Étterem: H–Cs 11–14 &amp; 17–22, P–Szo 11–14 &amp; 17–23, V 10–21.<br>Hentesüzlet: H–P 7–12 &amp; 14–18, Szo 7–12.',
            menu:         `Az étlapunkat ${pdf} formátumban találja.`,
            address:      'Untere Str. 24, 83416 Saaldorf — Salzburg és Freilassing között.',
            price:        `Az árakkal kapcsolatban kérjük, lépjen velünk kapcsolatba: ${tel}.`,
            breakfast:    'A reggeli az ár részét képezi — saját hentesüzletünk házi termékeivel.',
            butcher:      `Hentesüzletünk H–P 7–18 és Szo 7–12 között tart nyitva. Aktuális ajánlatok: ${offer}.`,
            area:         'Salzburg kb. 20 km-re, Berchtesgaden kb. 30 km-re van — ideális kiránduláshoz!',
            fallback:     `Köszönjük a kérdést! Részletes tájékoztatásért: ${tel} vagy ${mail}.`,
        },
        cs: {
            reservation: `Pro rezervace nás kontaktujte na ${tel} nebo ${mail}.`,
            rooms:        `Nabízíme útulné pokoje se snídaní. Kontaktujte nás: ${tel}.`,
            hours:        'Hostinec: Po–Čt 11–14 &amp; 17–22, Pá–So 11–14 &amp; 17–23, Ne 10–21.<br>Řeznictví: Po–Pá 7–12 &amp; 14–18, So 7–12.',
            menu:         `Náš jídelní lístek naleznete jako ${pdf}.`,
            address:      'Jsme na adrese Untere Str. 24, 83416 Saaldorf — mezi Salzburgem a Freilasingem.',
            price:        `Pro informace o cenách nás prosím kontaktujte přímo: ${tel}.`,
            breakfast:    'Snídaně je zahrnuta v ceně pokoje — s domácími produkty z našeho vlastního řeznictví.',
            butcher:      `Naše řeznictví je otevřeno Po–Pá 7–18 a So 7–12. Aktuální nabídka: ${offer}.`,
            area:         'Salzburg je cca 20 km daleko, Berchtesgaden cca 30 km — ideální pro výlety!',
            fallback:     `Děkujeme za dotaz! Pro podrobné informace: ${tel} nebo ${mail}.`,
        },
    };

    const s = r[lang] || r.de;

    if (/reservier|tisch|buchen|book|reserv|prenotar|foglal|rezerv/.test(t))  return s.reservation;
    if (/zimmer|übernacht|schlaf|room|camera|szoba|pokoj/.test(t))             return s.rooms;
    if (/öffnung|uhrzeit|wann|open|orari|nyitva|otev/.test(t))                return s.hours;
    if (/speise|karte|menü|menu|essen|food|étlap|jídel/.test(t))              return s.menu;
    if (/anfahrt|adresse|wo |address|where|cím|adresa/.test(t))               return s.address;
    if (/preis|kosten|price|prezzo|ár|cena/.test(t))                           return s.price;
    if (/frühstück|breakfast|colazione|reggeli|snídaně/.test(t))              return s.breakfast;
    if (/metzgerei|wurst|fleisch|butcher|macelleria|hentes|řeznictv/.test(t)) return s.butcher;
    if (/salzburg|berchtesgaden|ausflug/.test(t))                              return s.area;

    return s.fallback;
}
