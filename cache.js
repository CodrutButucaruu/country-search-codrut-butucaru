class CacheManager {
    constructor() {
        this.CACHE_KEYS = {
            countries: 'countries_cache',
            countriesExpiry: 'countries_cache_expiry',
            searchResults: 'search_results_cache',
            cacheExpiry: 24 * 60 * 60 * 1000 // 24 hours
        };
    }

    getCachedCountries() {
        const cached = localStorage.getItem(this.CACHE_KEYS.countries);
        const expiry = localStorage.getItem(this.CACHE_KEYS.countriesExpiry);
        
        if (cached && expiry && Date.now() < parseInt(expiry)) {
            console.log('Loaded countries from cache');
            return JSON.parse(cached);
        }
        return null;
    }

    setCachedCountries(data) {
        localStorage.setItem(this.CACHE_KEYS.countries, JSON.stringify(data));
        localStorage.setItem(this.CACHE_KEYS.countriesExpiry, String(Date.now() + this.CACHE_KEYS.cacheExpiry));
        console.log('Countries saved to cache');
    }

    getCachedSearchResults(query) {
        const cache = JSON.parse(localStorage.getItem(this.CACHE_KEYS.searchResults) || '{}');
        return cache[query] || null;
    }

    setCachedSearchResults(query, results) {
        const cache = JSON.parse(localStorage.getItem(this.CACHE_KEYS.searchResults) || '{}');
        cache[query] = results;
        localStorage.setItem(this.CACHE_KEYS.searchResults, JSON.stringify(cache));
    }

    getSearchHistory() {
        return JSON.parse(localStorage.getItem('searchHistory')) || [];
    }

    updateSearchHistory(query) {
        if (!query.trim()) return;
        let history = this.getSearchHistory();
        history = [query, ...history.filter(item => item !== query)].slice(0, 10);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        return history;
    }

    getFavorites() {
        return JSON.parse(localStorage.getItem('favorite') || '[]');
    }

    isFavorite(countryName) {
        return this.getFavorites().includes(countryName);
    }

    addFavorite(countryName) {
        let favorites = this.getFavorites();
        if (!favorites.includes(countryName)) {
            favorites.push(countryName);
            localStorage.setItem('favorite', JSON.stringify(favorites));
        }
    }

    removeFavorite(countryName) {
        let favorites = this.getFavorites();
        favorites = favorites.filter(name => name !== countryName);
        localStorage.setItem('favorite', JSON.stringify(favorites));
    }
    
}
