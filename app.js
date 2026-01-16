class CountrySearchApp {
    constructor() {
        this.input = document.getElementById('q');
        this.button = document.getElementById('btn');
        this.statusEl = document.getElementById('status');
        this.resultsEl = document.getElementById('results');
        
        this.countryService = new CountryService();
        this.cache = new CacheManager();
        this.ui = new UIRenderer(this.resultsEl);
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        document.addEventListener('DOMContentLoaded', () => this.loadCountries());
    }

    setupEventListeners() {
        // this.input.addEventListener('input', this.debounce(() => this.search(), 300));
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });
        this.button.addEventListener('click', () => this.search());
    }

    async loadCountries() {
        try {
            await this.countryService.loadCountries((msg) => {
                this.updateStatus(msg);
            });
        } catch (err) {
            this.updateStatus(err.message, true);
        }
    }

    search() {
        const q = this.input.value.trim();
        if (q.length < 3) {
            this.updateStatus('Type at least 3 characters.');
            return;
        }
        
        const results = this.countryService.search(q);
        const hasResults = this.ui.showResults(results);
        
        if (hasResults) {
            this.updateStatus(`${results.length} results`);
        } else {
            this.updateStatus('Nothing to show.');
        }
        
        const history = this.cache.updateSearchHistory(q);
        this.ui.renderSearchHistory(history);
    }

    searchFromHistory(query) {
        this.input.value = query;
        this.search();
    }

    updateStatus(message, isError = false) {
        this.statusEl.textContent = message;
        if (isError) {
            this.statusEl.classList.add('error');
        } else {
            this.statusEl.classList.remove('error');
        }
    }

    debounce(fn, ms = 300) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), ms);
        };
    }

    toggleFavorite(countryName) {
        if (this.cache.isFavorite(countryName)) {
            this.cache.removeFavorite(countryName);
        } else {
            this.cache.addFavorite(countryName);
        }

        const favoriteBtn = document.querySelector(`button[data-country="${countryName}"]`);
        if (favoriteBtn) {
            favoriteBtn.textContent = this.cache.isFavorite(countryName) ? '★' : '☆';
        }
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CountrySearchApp();
    app.loadCountries();
});
