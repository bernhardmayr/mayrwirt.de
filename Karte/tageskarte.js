(async function () {
    const res = await fetch('tageskarte.json');
    const data = await res.json();

    let html = '<h1 class="menu-title">' + data.title + '</h1>';
    if (data.date) {
        html += '<p class="menu-date">Gültig am ' + data.date + '</p>';
    }
    html += '<p class="menu-subtitle">' + data.subtitle + '</p>';

    for (const section of data.sections) {
        html += '<div class="section"><h2 class="section-title">' + section.title + '</h2>';

        if (section.type === 'items') {
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
    html += '<div class="pdf-link"><a href="Tageskarte.pdf" target="_blank">Als PDF herunterladen</a></div>';

    document.getElementById('menu-root').innerHTML = html;
})();
