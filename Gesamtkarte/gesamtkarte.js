(async function () {
    const BADGE_SHORT   = { vegan: 'Ve', vegetarisch: 'V', glutenfrei: 'GF', laktosefrei: 'LF', nussfrei: 'NF' };
    const ALL_TAGS      = ['vegan', 'vegetarisch', 'glutenfrei', 'laktosefrei', 'nussfrei'];
    const activeFilters = new Set();

    const lang = document.documentElement.lang || 'de';
    const [tRes, kRes] = await Promise.all([
        fetch('../Tageskarte/' + lang + '.json'),
        fetch('../Karte/' + lang + '.json')
    ]);
    const [tData, kData] = await Promise.all([tRes.json(), kRes.json()]);

    function badgeHtml(item) {
        if (!item.tags || !item.tags.length) return '';
        return '<span class="diet-badges">'
            + item.tags.map(t => '<span class="diet-badge diet-badge--' + t + '">' + BADGE_SHORT[t] + '</span>').join('')
            + '</span>';
    }

    function renderSections(sections) {
        let html = '';
        for (const section of sections) {
            html += '<div class="section" data-section>';
            html += '<h2 class="section-title">' + section.title + '</h2>';

            if (section.intro) {
                html += '<p class="section-intro">' + section.intro + '</p>';
            }

            if (section.type === 'wine-rec') {
                for (const item of section.items) {
                    html += '<div class="wine-rec-item"><div class="wine-rec-name">' + item.name + '</div>';
                    if (item.prices) {
                        html += '<div class="wine-rec-prices">';
                        for (const p of item.prices) html += '<span class="wine-rec-price">' + p + '</span>';
                        html += '</div>';
                    } else if (item.price) {
                        html += '<div class="wine-rec-prices"><span class="wine-rec-price">' + item.price + '</span></div>';
                    }
                    html += '</div>';
                }

            } else if (section.type === 'items') {
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
                        html += '<div class="item-price">' + (item.price || '') + '</div>';
                    }
                    html += '</div>';
                    if (item.options) {
                        for (const opt of item.options) {
                            html += '<div class="item-option">'
                                  + '<span class="item-option-label">' + opt.label + '</span>'
                                  + '<span class="item-option-price">' + opt.price + '</span>'
                                  + '</div>';
                        }
                    }
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
        return html;
    }

    let html = '<h1 class="menu-title">' + tData.title + '</h1>';

    if (tData.date) {
        try {
            const d = new Date(tData.date + 'T12:00:00');
            const fmt = d.toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            html += '<p class="menu-date">' + fmt + '</p>';
        } catch (e) {
            html += '<p class="menu-date">' + tData.date + '</p>';
        }
    }

    html += '<p class="menu-subtitle">' + tData.subtitle + '</p>';
    html += renderSections(tData.sections);
    html += '<div class="note">' + tData.note + '</div>';

    html += '<div class="menu-divider" aria-hidden="true"></div>';

    html += '<h1 class="menu-title menu-title--speise">' + kData.title + '</h1>';
    html += '<p class="menu-subtitle">' + kData.subtitle + '</p>';
    html += renderSections(kData.sections);
    html += '<div class="note">' + kData.note + '</div>';

    document.getElementById('menu-root').innerHTML = html;

    buildFilterBar(tData.filterLabels || {});
    bindFilterBar();

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
