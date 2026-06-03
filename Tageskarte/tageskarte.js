(async function () {
    const lang = document.documentElement.lang || 'de';
    const res  = await fetch(lang + '.json');
    const data = await res.json();

    let html = '<h1 class="menu-title">' + data.title + '</h1>';

    if (data.date) {
        try {
            const d = new Date(data.date + 'T12:00:00');
            const fmt = d.toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            html += '<p class="menu-date">' + fmt + '</p>';
        } catch (e) {
            html += '<p class="menu-date">' + data.date + '</p>';
        }
    }

    html += '<p class="menu-subtitle">' + data.subtitle + '</p>';

    for (const section of data.sections) {
        html += '<div class="section">';
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
                html += '<div class="item"><div class="item-info">';
                if (item.name) html += '<div class="item-name">' + item.name + '</div>';
                if (item.desc) html += '<div class="item-desc">' + item.desc + '</div>';
                html += '</div>';
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

    html += '<div class="note">' + data.note + '</div>';

    document.getElementById('menu-root').innerHTML = html;
})();
