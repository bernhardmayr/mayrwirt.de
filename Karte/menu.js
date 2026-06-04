(async function () {
    const BADGE_SHORT   = { vegetarisch: 'V', glutenfrei: 'GF', laktosefrei: 'LF', nussfrei: 'NF' };
    const ALL_TAGS      = ['vegetarisch', 'glutenfrei', 'laktosefrei', 'nussfrei'];
    const activeFilters = new Set();

    const lang = document.documentElement.lang || 'de';
    const res  = await fetch(lang + '.json');
    const data = await res.json();

    function badgeHtml(item) {
        if (!item.tags || !item.tags.length) return '';
        return '<span class="diet-badges">'
            + item.tags.map(t => '<span class="diet-badge diet-badge--' + t + '">' + BADGE_SHORT[t] + '</span>').join('')
            + '</span>';
    }

    let html = '<h1 class="menu-title">' + data.title + '</h1>';

    for (const section of data.sections) {
        html += '<div class="section" data-section><h2 class="section-title">' + section.title + '</h2>';

        if (section.type === 'items') {
            for (const item of section.items) {
                html += '<div class="item" data-tags="' + (item.tags || []).join(',') + '"><div class="item-info">';
                if (item.name) html += '<div class="item-name">' + item.name + '</div>';
                if (item.desc) html += '<div class="item-desc">' + item.desc + '</div>';
                html += badgeHtml(item) + '</div>';
                if (item.prices) {
                    html += '<div class="item-price-stack">';
                    for (const p of item.prices) html += '<div class="price-row">' + p + '</div>';
                    html += '</div>';
                } else {
                    html += '<div class="item-price">' + item.price + '</div>';
                }
                html += '</div>';
            }
        } else if (section.type === 'drinks') {
            html += '<div class="drinks-grid">';
            for (const item of section.items) {
                html += '<div class="drink-item"><span class="drink-name">' + item.name + '</span>'
                      + '<span class="drink-price">' + item.price + '</span></div>';
            }
            html += '</div>';
        } else if (section.type === 'wine') {
            for (const item of section.items) {
                html += '<div class="wine-item"><div class="wine-name">' + item.name + '</div>';
                if (item.producer) html += '<div class="wine-producer">' + item.producer + '</div>';
                html += '<div class="wine-price">' + item.price + '</div></div>';
            }
        }

        html += '</div>';
    }

    html += '<div class="note">' + data.note + '</div>';

    document.getElementById('menu-root').innerHTML = html;

    buildFilterBar(data.filterLabels || {});
    bindFilterBar();

    document.querySelectorAll('.lang-switcher a').forEach(a => {
        a.addEventListener('click', () => {
            localStorage.setItem('mayrwirt-lang', a.getAttribute('href').replace('.html', ''));
        });
    });

    function buildFilterBar(labels) {
        const bar = document.createElement('div');
        bar.className = 'diet-filter-bar';
        bar.id = 'diet-filter-bar';
        bar.innerHTML = ALL_TAGS.map(t =>
            '<button class="diet-chip" data-tag="' + t + '">' + (labels[t] || t) + '</button>'
        ).join('')
        + '<button class="diet-chip diet-chip--reset hidden" id="diet-reset">' + (labels.showAll || '✕') + '</button>';
        const root = document.getElementById('menu-root');
        root.insertBefore(bar, root.firstChild);
    }

    function applyFilters() {
        document.querySelectorAll('#menu-root .item[data-tags]').forEach(el => {
            if (!activeFilters.size) { el.style.display = ''; return; }
            const tags = el.dataset.tags ? el.dataset.tags.split(',').filter(Boolean) : [];
            el.style.display = tags.some(t => activeFilters.has(t)) ? '' : 'none';
        });
        document.querySelectorAll('#menu-root [data-section]').forEach(sec => {
            const items = sec.querySelectorAll('.item[data-tags]');
            if (!items.length) return;
            sec.style.display = Array.from(items).some(el => el.style.display !== 'none') ? '' : 'none';
        });
        const reset = document.getElementById('diet-reset');
        if (reset) reset.classList.toggle('hidden', !activeFilters.size);
    }

    function bindFilterBar() {
        const bar = document.getElementById('diet-filter-bar');
        if (!bar) return;
        bar.addEventListener('click', e => {
            const chip = e.target.closest('.diet-chip[data-tag]');
            if (chip) {
                const tag = chip.dataset.tag;
                if (activeFilters.has(tag)) {
                    activeFilters.delete(tag);
                    chip.classList.remove('active');
                } else {
                    activeFilters.add(tag);
                    chip.classList.add('active');
                }
                applyFilters();
                return;
            }
            if (e.target.closest('#diet-reset')) {
                activeFilters.clear();
                bar.querySelectorAll('.diet-chip.active').forEach(c => c.classList.remove('active'));
                applyFilters();
            }
        });
    }
})();
