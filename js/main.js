// ---- Lang dropdown ----
function toggleLangDropdown() {
    const dd      = document.getElementById('lang-dropdown');
    const btn     = document.getElementById('lang-dropdown-btn');
    const chevron = document.getElementById('lang-chevron');
    const opening = dd.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!opening));
    chevron.style.transform = opening ? '' : 'rotate(180deg)';
}

function closeLangDropdown() {
    const dd      = document.getElementById('lang-dropdown');
    const btn     = document.getElementById('lang-dropdown-btn');
    const chevron = document.getElementById('lang-chevron');
    dd.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    chevron.style.transform = '';
}

document.addEventListener('click', e => {
    const wrap = document.getElementById('lang-dropdown-wrap');
    if (wrap && !wrap.contains(e.target)) closeLangDropdown();
});

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

// ---- Live hours status ----
function initHoursStatus() {
    const now  = new Date();
    const day  = now.getDay();          // 0=Sun … 6=Sat
    const mins = now.getHours() * 60 + now.getMinutes();

    const lang = localStorage.getItem('mayrwirt-lang') || document.documentElement.lang || 'de';
    const labels = {
        de: { open: 'Jetzt geöffnet', closed: 'Heute geschlossen' },
        en: { open: 'Open now',        closed: 'Closed today' },
        it: { open: 'Aperto ora',      closed: 'Chiuso oggi' },
        hu: { open: 'Most nyitva',     closed: 'Ma zárva' },
        cs: { open: 'Nyní otevřeno',   closed: 'Dnes zavřeno' },
    };
    const lbl = labels[lang] || labels.de;

    // Restaurant: So + Mo Ruhetag, Di–Sa 17:00–22:00 (Küche bis 21, Sperrstunde 22)
    function restOpen() {
        if (day === 0 || day === 1) return false;
        return mins >= 1020 && mins < 1320;
    }
    // Butcher: Mo/Mi 7:30–12, Di/Do 7:30–12 & 14–17:30, Fr 7:30–12 & 14–18, Sa 7:30–12, So closed
    function butchOpen() {
        if (day === 1 || day === 3) return mins >= 450 && mins < 720;
        if (day === 2 || day === 4) return (mins >= 450 && mins < 720) || (mins >= 840 && mins < 1050);
        if (day === 5) return (mins >= 450 && mins < 720) || (mins >= 840 && mins < 1080);
        if (day === 6) return mins >= 450 && mins < 720;
        return false;
    }

    function setBadge(id, isOpen, inv) {
        const el = document.getElementById(id);
        if (!el) return;
        el.className = 'status-badge' + (inv ? ' status-badge-inv' : '') + (isOpen ? ' open' : ' closed');
        el.textContent = isOpen ? lbl.open : lbl.closed;
    }
    setBadge('rest-status',  restOpen(),  false);
    setBadge('butch-status', butchOpen(), true);

    // Highlight today's row — restaurant table
    document.querySelectorAll('[data-days]').forEach(row => {
        const days = row.getAttribute('data-days').split(',').map(Number);
        if (days.includes(day)) {
            row.querySelectorAll('span').forEach(s => s.classList.add('font-semibold', 'text-forest'));
        }
    });
    // Highlight today's row — butcher table
    document.querySelectorAll('[data-days-butch]').forEach(row => {
        const days = row.getAttribute('data-days-butch').split(',').map(Number);
        if (days.includes(day)) {
            row.querySelectorAll('span').forEach(s => s.classList.add('font-bold', 'text-white'));
        }
    });
}
document.addEventListener('DOMContentLoaded', initHoursStatus);

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
    const actUrls = { de: 'ausflugsziele/index.html', en: 'ausflugsziele/en.html', it: 'ausflugsziele/it.html', hu: 'ausflugsziele/hu.html', cs: 'ausflugsziele/cs.html' };
    const act  = `<a href="${actUrls[lang] || actUrls.de}" class="font-semibold text-green-800">${({de:'Ausflugsziele',en:'destinations page',it:'mete e gite',hu:'kirándulóhelyek',cs:'výlety'})[lang] || 'Ausflugsziele'}</a>`;
    const zimmerUrls = { de: 'zimmer/index.html', en: 'zimmer/en.html', it: 'zimmer/it.html', hu: 'zimmer/hu.html', cs: 'zimmer/cs.html' };
    const zimmer = `<a href="${zimmerUrls[lang] || zimmerUrls.de}" class="font-semibold text-green-800">${({de:'Zimmer &amp; Buchung',en:'Rooms &amp; Booking',it:'Camere &amp; Prenotazione',hu:'Szobák &amp; Foglalás',cs:'Pokoje &amp; Rezervace'})[lang] || 'Zimmer &amp; Buchung'}</a>`;

    const r = {
        de: {
            activities:   `In der Umgebung gibt es über 30 Ausflugsziele — Berge, Seen, Kultur & mehr. Stöbern Sie auf unserer Seite ${act} und filtern Sie nach Interesse, Entfernung und Wetter.`,
            jobs:         `Wir suchen aktuell eine Zimmermädchen (m/w/d) und eine Verkäuferin (m/w/d) für unsere Metzgerei. Bewerbungen bitte an ${mail} oder ${tel}.`,
            reservation: `Für Reservierungen erreichen Sie uns unter ${tel} oder per ${mail}.`,
            rooms:        `Wir bieten gemütliche Zimmer mit Frühstück ab €75/Nacht. Mehr Infos und direkte Buchung: ${zimmer}.`,
            hours:        'Wirtshaus: Di–Sa 17–21 Uhr, Sperrstunde 22:00. So + Mo Ruhetag.<br>Metzgerei: Mo/Mi 7:30–12, Di/Do 7:30–12 &amp; 14–17:30, Fr 7:30–12 &amp; 14–18, Sa 7:30–12.',
            menu:         `Unsere Speisekarte finden Sie als ${pdf}.`,
            address:      'Wir sind in der Untere Str. 24, 83416 Saaldorf — zwischen Salzburg und Freilassing.',
            price:        `Für Preisinformationen kontaktieren Sie uns bitte direkt: ${tel}.`,
            breakfast:    'Frühstück ist in der Zimmermiete inklusive — mit hausgemachten Produkten aus unserer Metzgerei.',
            butcher:      `Unsere Metzgerei: Mo/Mi 7:30–12, Di/Do 7:30–12 &amp; 14–17:30, Fr 7:30–12 &amp; 14–18, Sa 7:30–12. Aktuelle Angebote: ${offer}.`,
            area:         'Salzburg ist ca. 20 km entfernt, Berchtesgaden ca. 30 km — ideal für Tagesausflüge!',
            fallback:     `Vielen Dank für Ihre Frage! Für genaue Auskünfte: ${tel} oder ${mail}.`,
        },
        en: {
            activities:   `There are over 30 things to do nearby — mountains, lakes, culture & more. Browse our ${act} and filter by interest, distance and weather.`,
            jobs:         `We are currently looking for a Housekeeping Staff (m/f/d) and a Butcher Shop Sales Assistant (m/f/d). Please send your application to ${mail} or call ${tel}.`,
            reservation: `For reservations please contact us at ${tel} or ${mail}.`,
            rooms:        `We offer cosy rooms with breakfast included from €75/night. More info and direct booking: ${zimmer}.`,
            hours:        'Restaurant: Tue–Sat 5–9pm, closing time 10pm. Sun + Mon closed.<br>Butcher: Mon/Wed 7:30–12, Tue/Thu 7:30–12 &amp; 2–5:30pm, Fri 7:30–12 &amp; 2–6pm, Sat 7:30–12.',
            menu:         `You can find our menu as a ${pdf}.`,
            address:      'We are located at Untere Str. 24, 83416 Saaldorf — between Salzburg and Freilassing.',
            price:        `For price information please contact us directly: ${tel}.`,
            breakfast:    `Breakfast is included in the room rate — with home-made products from our own butcher's shop.`,
            butcher:      `Butcher: Mon/Wed 7:30–12, Tue/Thu 7:30–12 &amp; 2–5:30pm, Fri 7:30–12 &amp; 2–6pm, Sat 7:30–12. Current offers: ${offer}.`,
            area:         'Salzburg is approx. 20 km away, Berchtesgaden approx. 30 km — perfect for day trips!',
            fallback:     `Thank you for your question! For detailed information: ${tel} or ${mail}.`,
        },
        it: {
            activities:   `Nei dintorni ci sono oltre 30 mete — montagne, laghi, cultura e altro. Sfoglia la nostra pagina ${act} e filtra per interesse, distanza e meteo.`,
            jobs:         `Stiamo cercando un addetta alle pulizie (m/f/d) e una commessa per la macelleria (m/f/d). Invia la tua candidatura a ${mail} o chiamaci al ${tel}.`,
            reservation: `Per prenotazioni ci può contattare al ${tel} o via ${mail}.`,
            rooms:        `Offriamo camere accoglienti con colazione inclusa da €75/notte. Maggiori info e prenotazione diretta: ${zimmer}.`,
            hours:        'Ristorante: Mar–Sab 17–21, chiusura 22:00. Dom + Lun giorno di riposo.<br>Macelleria: Lun/Mer 7:30–12, Mar/Gio 7:30–12 &amp; 14–17:30, Ven 7:30–12 &amp; 14–18, Sab 7:30–12.',
            menu:         `Il nostro menù è disponibile come ${pdf}.`,
            address:      'Siamo a Untere Str. 24, 83416 Saaldorf — tra Salisburgo e Freilassing.',
            price:        `Per informazioni sui prezzi contattateci direttamente: ${tel}.`,
            breakfast:    'La colazione è inclusa nel prezzo della camera — con prodotti artigianali della nostra macelleria.',
            butcher:      `Macelleria: Lun/Mer 7:30–12, Mar/Gio 7:30–12 &amp; 14–17:30, Ven 7:30–12 &amp; 14–18, Sab 7:30–12. Offerte: ${offer}.`,
            area:         'Salisburgo è a circa 20 km, Berchtesgaden a circa 30 km — ideale per gite!',
            fallback:     `Grazie per la domanda! Per informazioni: ${tel} o ${mail}.`,
        },
        hu: {
            activities:   `A környéken több mint 30 kirándulóhely található — hegyek, tavak, kultúra és más. Böngésszen a ${act} oldalunkon, és szűrjön érdeklődés, távolság és időjárás szerint.`,
            jobs:         `Jelenleg szobaasszonyt (m/n/d) és hentesüzleti eladót (m/n/d) keresünk. Önéletrajzát küldje az ${mail} címre vagy hívjon: ${tel}.`,
            reservation: `Foglaláshoz hívjon minket: ${tel} vagy írjon: ${mail}.`,
            rooms:        `Reggelivel ellátott, hangulatos szobákat kínálunk €75/éjtől. Bővebb információ és közvetlen foglalás: ${zimmer}.`,
            hours:        'Étterem: K–Szo 17–21, zárás 22:00. V + H szünnap.<br>Hentesüzlet: H/Sze 7:30–12, K/Cs 7:30–12 &amp; 14–17:30, P 7:30–12 &amp; 14–18, Szo 7:30–12.',
            menu:         `Az étlapunkat ${pdf} formátumban találja.`,
            address:      'Untere Str. 24, 83416 Saaldorf — Salzburg és Freilassing között.',
            price:        `Az árakkal kapcsolatban kérjük, lépjen velünk kapcsolatba: ${tel}.`,
            breakfast:    'A reggeli az ár részét képezi — saját hentesüzletünk házi termékeivel.',
            butcher:      `Hentesüzlet: H/Sze 7:30–12, K/Cs 7:30–12 &amp; 14–17:30, P 7:30–12 &amp; 14–18, Szo 7:30–12. Aktuális ajánlatok: ${offer}.`,
            area:         'Salzburg kb. 20 km-re, Berchtesgaden kb. 30 km-re van — ideális kiránduláshoz!',
            fallback:     `Köszönjük a kérdést! Részletes tájékoztatásért: ${tel} vagy ${mail}.`,
        },
        cs: {
            activities:   `V okolí je přes 30 výletních cílů — hory, jezera, kultura a další. Prohlédněte si naši stránku ${act} a filtrujte podle zájmu, vzdálenosti a počasí.`,
            jobs:         `Hledáme pokojskou (m/ž/d) a prodavač/ku do řeznictví (m/ž/d). Přihlášky zasílejte na ${mail} nebo volejte ${tel}.`,
            reservation: `Pro rezervace nás kontaktujte na ${tel} nebo ${mail}.`,
            rooms:        `Nabízíme útulné pokoje se snídaní od €75/noc. Více informací a přímá rezervace: ${zimmer}.`,
            hours:        'Hostinec: Út–So 17–21, zavírání 22:00. Ne + Po zavřeno.<br>Řeznictví: Po/St 7:30–12, Út/Čt 7:30–12 &amp; 14–17:30, Pá 7:30–12 &amp; 14–18, So 7:30–12.',
            menu:         `Náš jídelní lístek naleznete jako ${pdf}.`,
            address:      'Jsme na adrese Untere Str. 24, 83416 Saaldorf — mezi Salzburgem a Freilasingem.',
            price:        `Pro informace o cenách nás prosím kontaktujte přímo: ${tel}.`,
            breakfast:    'Snídaně je zahrnuta v ceně pokoje — s domácími produkty z našeho vlastního řeznictví.',
            butcher:      `Řeznictví: Po/St 7:30–12, Út/Čt 7:30–12 &amp; 14–17:30, Pá 7:30–12 &amp; 14–18, So 7:30–12. Aktuální nabídka: ${offer}.`,
            area:         'Salzburg je cca 20 km daleko, Berchtesgaden cca 30 km — ideální pro výlety!',
            fallback:     `Děkujeme za dotaz! Pro podrobné informace: ${tel} nebo ${mail}.`,
        },
    };

    const s = r[lang] || r.de;

    if (/stell|job|karriere|arbeit|bewerb|career|lavoro|állás|práce|pokojsk|zimmermäd|verkäuf/.test(t)) return s.jobs;
    if (/reservier|tisch|buchen|book|reserv|prenotar|foglal|rezerv/.test(t))  return s.reservation;
    if (/zimmer|übernacht|schlaf|room|camera|szoba|pokoj/.test(t))             return s.rooms;
    if (/öffnung|uhrzeit|wann|open|orari|nyitva|otev/.test(t))                return s.hours;
    if (/speise|karte|menü|menu|essen|food|étlap|jídel/.test(t))              return s.menu;
    if (/anfahrt|adresse|wo |address|where|cím|adresa/.test(t))               return s.address;
    if (/preis|kosten|price|prezzo|ár|cena/.test(t))                           return s.price;
    if (/frühstück|breakfast|colazione|reggeli|snídaně/.test(t))              return s.breakfast;
    if (/metzgerei|wurst|fleisch|butcher|macelleria|hentes|řeznictv/.test(t)) return s.butcher;
    if (/ausflug|aktivit|unternehm|freizeit|sehenswür|wandern|excursion|things to do|attraction|activit|kirándul|látnivaló|výlet|atrakce|cosa fare|escursion|gita/.test(t)) return s.activities;
    if (/salzburg|berchtesgaden/.test(t))                                      return s.area;

    return s.fallback;
}
