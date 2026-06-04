/*
 * Ausflugsziele-Karte — interactive Leaflet/OpenStreetMap overview of all
 * destinations from ../activities.json. Filtering logic mirrors activities.js
 * (the card list page). Leaflet's global is `L`; localized texts are `T`.
 */
(async function () {
    const lang = document.documentElement.lang || 'de';

    // Starting point for all Google Maps routes / the "you are here" marker
    const ORIGIN      = 'Mayrwirt, Untere Straße 24, 83416 Saaldorf-Surheim';
    const ORIGIN_LAT  = 47.878;
    const ORIGIN_LNG  = 12.872;

    const res  = await fetch('../activities.json');
    const data = await res.json();
    const T    = data.labels[lang] || data.labels.de;

    // Only destinations that carry coordinates can be placed on the map
    const activities = data.activities
        .filter(a => typeof a.lat === 'number' && typeof a.lng === 'number')
        .sort((a, b) => a.distance - b.distance);

    // ---- Filter state (same shape as activities.js) ----
    const state = { roles: new Set(), cats: new Set(), seasons: new Set(), dist: null, search: '' };

    // ---- Header / intro texts ----
    document.getElementById('act-title').textContent = T.mapTitle || T.title;
    const introEl = document.getElementById('act-intro');
    if (introEl) introEl.textContent = T.mapIntro || T.intro;
    const listEl = document.getElementById('act-list-link');
    if (listEl) listEl.textContent = '☰ ' + (T.listLink || 'Liste');

    // ---- Build filter bar (identical to activities.js) ----
    const distOptions = [
        { key: 'd10', max: 10 },
        { key: 'd25', max: 25 },
        { key: 'd50', max: 50 },
        { key: 'd60', max: 60 },
    ];

    function chipGroup(legend, dim, entries) {
        let h = '<div class="filter-group"><span class="filter-legend">' + legend + '</span><div class="filter-chips">';
        for (const [value, label] of entries) {
            h += '<button class="filter-chip" data-dim="' + dim + '" data-value="' + value + '">' + label + '</button>';
        }
        h += '</div></div>';
        return h;
    }

    let filterHtml = '';
    filterHtml += chipGroup(T.filterRole,   'roles',   Object.entries(T.roles));
    filterHtml += chipGroup(T.filterCat,    'cats',    Object.entries(T.cats));
    filterHtml += chipGroup(T.filterSeason, 'seasons', Object.entries(T.seasons));
    filterHtml += chipGroup(T.filterDist,   'dist',    distOptions.map(o => [o.key, T.dists[o.key]]));
    filterHtml += '<button id="filter-reset" class="filter-reset">✕ ' + T.reset + '</button>';

    document.getElementById('act-filters').innerHTML = filterHtml;

    // ---- Search bar (inserted before filter box) ----
    const searchWrap = document.createElement('div');
    searchWrap.className = 'act-search-wrap';
    searchWrap.innerHTML = '<input id="act-search-input" type="search" class="act-search-input" placeholder="' + (T.search || 'Suchen …') + '" autocomplete="off">';
    const filtersEl = document.getElementById('act-filters');
    filtersEl.parentNode.insertBefore(searchWrap, filtersEl);

    document.getElementById('act-search-input').addEventListener('input', e => {
        state.search = e.target.value.trim().toLowerCase();
        render();
    });

    // ---- Leaflet map ----
    const map = L.map('map', { scrollWheelZoom: false }).setView([ORIGIN_LAT, ORIGIN_LNG], 10);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Activate scroll-zoom only after the user clicks the map (avoids hijacking page scroll)
    map.on('focus',  () => map.scrollWheelZoom.enable());
    map.on('blur',   () => map.scrollWheelZoom.disable());

    const cluster = L.markerClusterGroup({ maxClusterRadius: 45, spiderfyOnMaxZoom: true });
    map.addLayer(cluster);

    // Highlighted origin marker (the Mayrwirt itself)
    const originIcon = L.divIcon({
        className: '',
        html: '<div class="act-marker origin" title="Mayrwirt">🏠</div>',
        iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -18]
    });
    L.marker([ORIGIN_LAT, ORIGIN_LNG], { icon: originIcon, zIndexOffset: 1000 })
        .bindPopup('<div class="map-popup"><h3 class="mp-name">Mayrwirt</h3><div class="mp-town">📍 ' + (T.here || 'Mayrwirt') + '</div></div>')
        .addTo(map);

    function markerIcon(a) {
        return L.divIcon({
            className: '',
            html: '<div class="act-marker">' + a.icon + '</div>',
            iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -16]
        });
    }

    function popupHtml(a) {
        const t  = a.i18n[lang] || a.i18n.de;
        const de = a.i18n.de;
        const mapsUrl = 'https://www.google.com/maps/dir/?api=1'
            + '&origin=' + encodeURIComponent(ORIGIN)
            + '&destination=' + encodeURIComponent(de.name + ', ' + de.town);
        return ''
            + '<div class="map-popup">'
            +   '<div class="mp-top"><span class="mp-icon">' + a.icon + '</span>'
            +     '<span class="mp-dist">' + a.distance + ' km</span></div>'
            +   '<h3 class="mp-name">' + t.name + '</h3>'
            +   '<div class="mp-town">📍 ' + t.town + '</div>'
            +   '<p class="mp-desc">' + t.desc + '</p>'
            +   '<div class="mp-links">'
            +     '<a href="' + a.url + '" target="_blank" rel="noopener">' + T.more + ' →</a>'
            +     '<a href="' + mapsUrl + '" target="_blank" rel="noopener">📍 ' + (T.route || 'Route') + '</a>'
            +   '</div>'
            + '</div>';
    }

    function matches(a) {
        if (state.roles.size   && !a.roles.some(r => state.roles.has(r)))      return false;
        if (state.cats.size    && !a.categories.some(c => state.cats.has(c)))  return false;
        if (state.seasons.size && !a.seasons.some(s => state.seasons.has(s)))  return false;
        if (state.dist !== null && a.distance > state.dist)                    return false;
        if (state.search) {
            const t = a.i18n[lang] || a.i18n.de;
            if (!(t.name + ' ' + t.town + ' ' + t.desc).toLowerCase().includes(state.search)) return false;
        }
        return true;
    }

    function render(fit) {
        const visible = activities.filter(matches);
        document.getElementById('act-count').textContent = visible.length + ' ' + T.found;

        cluster.clearLayers();
        const markers = visible.map(a =>
            L.marker([a.lat, a.lng], { icon: markerIcon(a) }).bindPopup(popupHtml(a))
        );
        cluster.addLayers(markers);

        if (fit && markers.length) {
            const group = L.featureGroup(markers.concat(L.marker([ORIGIN_LAT, ORIGIN_LNG])));
            map.fitBounds(group.getBounds().pad(0.12));
        }
    }

    // ---- Filter interactions (same as activities.js) ----
    document.getElementById('act-filters').addEventListener('click', e => {
        const chip = e.target.closest('.filter-chip');
        if (chip) {
            const dim = chip.dataset.dim;
            const val = chip.dataset.value;
            if (dim === 'dist') {
                const max = distOptions.find(o => o.key === val).max;
                if (state.dist === max) {
                    state.dist = null;
                    chip.classList.remove('active');
                } else {
                    state.dist = max;
                    document.querySelectorAll('.filter-chip[data-dim="dist"]').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                }
            } else {
                const set = state[dim];
                if (set.has(val)) { set.delete(val); chip.classList.remove('active'); }
                else              { set.add(val);    chip.classList.add('active'); }
            }
            render(true);
            return;
        }
        if (e.target.closest('#filter-reset')) resetFilters();
    });

    function resetFilters() {
        state.roles.clear();
        state.cats.clear();
        state.seasons.clear();
        state.dist = null;
        state.search = '';
        document.querySelectorAll('.filter-chip.active').forEach(c => c.classList.remove('active'));
        const inp = document.getElementById('act-search-input');
        if (inp) inp.value = '';
        render(true);
    }

    // Keep main page language in sync when switching via the dropdown
    document.querySelectorAll('.sub-lang-menu a').forEach(a => {
        a.addEventListener('click', () => {
            const href = a.getAttribute('href').replace('.html', '');
            const code = href === 'index' ? 'de' : href;
            localStorage.setItem('mayrwirt-lang', code);
        });
    });

    // Initial render + fit to all markers
    render(true);

    // Pre-filter from URL hash, e.g. #cat=mountains or #role=family
    const hash = location.hash.slice(1);
    if (hash) {
        const [dim, val] = hash.split('=');
        const stateKey = dim === 'cat' ? 'cats' : dim === 'role' ? 'roles' : null;
        if (stateKey && val) {
            state[stateKey].add(val);
            const chip = document.querySelector('.filter-chip[data-dim="' + stateKey + '"][data-value="' + val + '"]');
            if (chip) chip.classList.add('active');
            render(true);
        }
    }
})();
