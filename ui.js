class UIRenderer {
    constructor(resultsEl) {
        this.resultsEl = resultsEl;
        this.selectedResultIndex = -1;
        this.cache = new CacheManager();
    }

    renderCountryCard(country) {
        const name = country?.name?.common ?? 'Unknown';
        const capital = Array.isArray(country.capital) ? country.capital[0] : (country.capital ?? '—');
        const population = country.population?.toLocaleString('ro-RO') ?? '—';
        const languages = country.languages ? Object.values(country.languages).join(', ') : '—';
        const currencies = country.currencies ? Object.values(country.currencies).map(c => c.name).join(', ') : '—';
        const flagSrc = country.flags?.svg || country.flags?.png;
        const mapsUrl = country.maps?.googleMaps || '#';

        const wrapper = document.createElement('div');
        wrapper.className = 'card';

        const img = document.createElement('img');
        img.className = 'flag';
        img.src = flagSrc;
        img.alt = 'Flag of ' + name;

        const right = document.createElement('div');

        const title = document.createElement('h2');
        title.textContent = name;

        const meta = document.createElement('div');
        meta.className = 'meta';

        const makeRow = (label, value) => {
            const row = document.createElement('div');
            const l = document.createElement('span');
            l.textContent = label;
            const v = document.createElement('span');
            v.textContent = value;
            row.append(l, document.createTextNode(' '), v);
            return row;
        };

        const mapRow = document.createElement('div');
        const lMap = document.createElement('span');
        lMap.textContent = 'Map:';
        // to do small functions
        const link = document.createElement('a');
        link.href = mapsUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Google Maps';
        mapRow.append(lMap, document.createTextNode(' '), link);

        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        favoriteBtn.setAttribute('data-country', name);
        favoriteBtn.textContent = this.cache.isFavorite(name) ? '★' : '☆';
        favoriteBtn.onclick = () => app.toggleFavorite(name);

        meta.append(
            makeRow('Capital:', capital),
            makeRow('Population:', population),
            makeRow('Language:', languages),
            makeRow('Currency:', currencies),
            mapRow
        );

        right.append(title, meta);
        wrapper.append(img, right);
        wrapper.appendChild(favoriteBtn);

        return wrapper;
    }
    // to do a main render function + another small render functions instead of renderCountryCard 

    showResults(items) {
        this.resultsEl.textContent = '';
        this.selectedResultIndex = -1;
        
        if (!items.length) {
            return false;
        }
        
        items.slice(0, 30).forEach((country, index) => {
            const card = this.renderCountryCard(country);
            card.setAttribute('data-index', index);
            this.resultsEl.appendChild(card);
        });
        return true;
    }

    showAllCountries(items) {
        this.resultsEl.textContent = '';
        this.selectedResultIndex = -1;

        if (!items.length) {
            return false;
        }
        
        items.forEach((country, index) => {
            const card = this.renderCountryCard(country);
            card.setAttribute('data-index', index);
            this.resultsEl.appendChild(card);
        });
        return true;
    }

    renderSearchHistory(history) {
        const searchbar = document.querySelector('.searchbar');
        let historyEl = document.getElementById('history');
        
        if (!historyEl) {
            historyEl = document.createElement('div');
            historyEl.id = 'history';
            searchbar.insertAdjacentElement('afterend', historyEl);
        }
        
        historyEl.innerHTML = '<h3>Recent Searches:</h3>' + history.map(item => 
            `<button onclick="app.searchFromHistory('${item}')">${item}</button>`
        ).join('');
    }

    renderFavorites(history) {
        const searchbar = document.querySelector('.searchbar');      
        let favoritesListEl = document.getElementById('favoritesList');
        if (!favoritesListEl) {
            favoritesListEl = document.createElement('div');
            favoritesListEl.id = 'favoritesList';
            searchbar.insertAdjacentElement('afterend', favoritesListEl);
        }

        if (this.cache.getFavorites().length === 0) {
            favoritesListEl.innerHTML = '<p>No favorite countries yet. Click the ☆ button on a country card to add it to favorites.<p>';
            return;
        }

        favoritesListEl.innerHTML = '<h3>Favorites:</h3>' + history.map(item => 
            `<button onclick="app.searchFromHistory('${item}')">${item}</button>`
        ).join('');
    }

    selectResult(index) {
        const cards = this.resultsEl.querySelectorAll('.card');
        if (cards.length === 0) return;
        
        cards.forEach(card => card.classList.remove('selected'));
        
        if (index < -1) index = -1;
        if (index >= cards.length) index = cards.length - 1;
        
        this.selectedResultIndex = index;
        
        if (index >= 0) {
            cards[index].classList.add('selected');
            cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}
