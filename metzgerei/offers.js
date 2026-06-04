(async function () {
    const lang = document.documentElement.lang || 'de';
    const res  = await fetch(lang + '.json');
    const data = await res.json();

    let html = '';
    html += '<h1 class="offers-title">' + data.title + '</h1>';
    if (data.subtitle)  html += '<p class="offers-subtitle">' + data.subtitle + '</p>';
    if (data.validUntil) html += '<p class="offers-valid">' + data.validUntil + '</p>';

    // Top offer — highlighted cards
    if (data.topItems && data.topItems.length) {
        html += '<div class="top-offer">';
        if (data.topTitle) html += '<div class="top-offer-label">' + data.topTitle + '</div>';
        html += '<div class="top-offer-grid">';
        for (const it of data.topItems) {
            html += '<div class="top-card">'
                  + '<div class="top-card-name">' + it.name + '</div>'
                  + '<div class="top-card-price">'
                  + (it.unit ? '<span class="top-card-unit">' + it.unit + '</span>' : '')
                  + '<span class="top-card-amount">' + it.price + '</span>'
                  + '</div></div>';
        }
        html += '</div></div>';
    }

    // Offer list
    if (data.offerItems && data.offerItems.length) {
        html += '<div class="section">';
        if (data.offerTitle) html += '<h2 class="section-title">' + data.offerTitle + '</h2>';
        for (const it of data.offerItems) {
            html += '<div class="offer-row"><div class="offer-info"><div class="offer-name">' + it.name + '</div>';
            if (it.desc) html += '<div class="offer-desc">' + it.desc + '</div>';
            html += '</div><div class="offer-price">'
                  + (it.unit ? '<span class="offer-unit">' + it.unit + '</span>' : '')
                  + '<span class="offer-amount">' + it.price + '</span>'
                  + '</div></div>';
        }
        html += '</div>';
    }

    if (data.beefNote) html += '<p class="beef-note">' + data.beefNote + '</p>';

    // Opening hours
    if (data.hours && data.hours.length) {
        html += '<div class="hours-card">';
        if (data.hoursTitle) html += '<h3 class="hours-title">' + data.hoursTitle + '</h3>';
        for (const h of data.hours) {
            html += '<div class="hours-row"><span class="hours-day">' + h.day + '</span>'
                  + '<span class="hours-time">' + h.time + '</span></div>';
        }
        html += '</div>';
    }

    if (data.disclaimer) html += '<p class="offers-disclaimer">' + data.disclaimer + '</p>';

    document.getElementById('offers-root').innerHTML = html;
})();
