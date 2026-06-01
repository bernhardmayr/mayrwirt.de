(async function () {
    const lang = document.documentElement.lang || 'de';

    const res  = await fetch('activities.json');
    const data = await res.json();
    const L    = data.labels[lang] || data.labels.de;

    // Sort by distance ascending (nearest first)
    const activities = data.activities.slice().sort((a, b) => a.distance - b.distance);

    // ---- Filter state ----
    const state = { roles: new Set(), cats: new Set(), seasons: new Set(), dist: null };

    // ---- Header texts ----
    document.getElementById('act-title').textContent    = L.title;
    document.getElementById('act-subtitle').textContent = L.subtitle;
    document.getElementById('act-intro').textContent    = L.intro;
    const backEl = document.getElementById('act-back');
    if (backEl) backEl.textContent = L.back;

    // ---- Build filter bar ----
    const distOptions = [
        { key: 'd10', max: 10 },
        { key: 'd25', max: 25 },
        { key: 'd50', max: 50 },
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
    filterHtml += chipGroup(L.filterRole,   'roles',   Object.entries(L.roles));
    filterHtml += chipGroup(L.filterCat,    'cats',    Object.entries(L.cats));
    filterHtml += chipGroup(L.filterSeason, 'seasons', Object.entries(L.seasons));
    filterHtml += chipGroup(L.filterDist,   'dist',    distOptions.map(o => [o.key, L.dists[o.key]]));
    filterHtml += '<button id="filter-reset" class="filter-reset">✕ ' + L.reset + '</button>';

    document.getElementById('act-filters').innerHTML = filterHtml;

    // ---- Card rendering ----
    function cardHtml(a) {
        const t    = a.i18n[lang] || a.i18n.de;
        const tags = [];
        tags.push('<span class="tag-pill tag-cat">' + L.cats[a.category] + '</span>');
        for (const r of a.roles) tags.push('<span class="tag-pill">' + L.roles[r] + '</span>');

        return ''
            + '<article class="activity-card">'
            +   '<div class="activity-top">'
            +     '<span class="activity-icon">' + a.icon + '</span>'
            +     '<span class="activity-dist">' + a.distance + ' km</span>'
            +   '</div>'
            +   '<h3 class="activity-name">' + t.name + '</h3>'
            +   '<div class="activity-town">📍 ' + t.town + '</div>'
            +   '<p class="activity-desc">' + t.desc + '</p>'
            +   '<div class="activity-tags">' + tags.join('') + '</div>'
            +   '<a class="activity-link" href="' + a.url + '" target="_blank" rel="noopener">' + L.more + ' →</a>'
            + '</article>';
    }

    function matches(a) {
        if (state.roles.size   && !a.roles.some(r => state.roles.has(r)))     return false;
        if (state.cats.size    && !state.cats.has(a.category))                return false;
        if (state.seasons.size && !a.seasons.some(s => state.seasons.has(s))) return false;
        if (state.dist !== null && a.distance > state.dist)                   return false;
        return true;
    }

    function render() {
        const visible = activities.filter(matches);
        const grid    = document.getElementById('act-grid');
        const count   = document.getElementById('act-count');

        count.textContent = visible.length + ' ' + L.found;

        if (visible.length === 0) {
            grid.innerHTML = '<p class="act-empty">' + L.none + '</p>';
        } else {
            grid.innerHTML = visible.map(cardHtml).join('');
        }
    }

    // ---- Filter interactions ----
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
            render();
            return;
        }
        if (e.target.closest('#filter-reset')) resetFilters();
    });

    function resetFilters() {
        state.roles.clear();
        state.cats.clear();
        state.seasons.clear();
        state.dist = null;
        document.querySelectorAll('.filter-chip.active').forEach(c => c.classList.remove('active'));
        render();
    }

    // ---- Schema.org ItemList JSON-LD (localized, for rich search results) ----
    const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": L.title,
        "numberOfItems": activities.length,
        "itemListElement": activities.map((a, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
                "@type": "TouristAttraction",
                "name": (a.i18n[lang] || a.i18n.de).name,
                "url": a.url
            }
        }))
    };
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify(itemList);
    document.head.appendChild(ld);

    // ---- localStorage sync on language switch (keeps main page in sync) ----
    document.querySelectorAll('.lang-switcher a').forEach(a => {
        a.addEventListener('click', () => {
            const href = a.getAttribute('href').replace('.html', '');
            const code = href === 'index' ? 'de' : href;
            localStorage.setItem('mayrwirt-lang', code);
        });
    });

    render();
})();
