class CountryService {
    constructor() {
        this.allCountries = [];
        this.loadingAll = false;
        this.apiUrl = 'https://restcountries.com/v3.1/all?fields=name,capital,population,languages,currencies,flags,maps';
        this.cache = new CacheManager();
    }

    async loadCountries(onStatusUpdate) {
        if (this.loadingAll || this.allCountries.length) return;
        
        const cached = this.cache.getCachedCountries();
        if (cached) {
            this.allCountries = cached;
            onStatusUpdate('Type a country name and press search.');
            return;
        }
        
        this.loadingAll = true;
        onStatusUpdate('Loading all countries');
        try {
            const res = await fetch(this.apiUrl);
            if (!res.ok) throw new Error('Network error ' + res.status);
            this.allCountries = await res.json();
            this.cache.setCachedCountries(this.allCountries);
            onStatusUpdate('Type a country name and press search.');
        } catch (err) {
            console.error(err);
            throw new Error('Error: ' + err.message);
        } finally {
            this.loadingAll = false;
        }
    }

    filterCountries(query) {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return this.allCountries
            .filter(c => (c?.name?.common?.toLowerCase() || '').includes(q))
            .sort((a, b) => a.name.common.localeCompare(b.name.common));
    }

    search(query) {
        let results = this.cache.getCachedSearchResults(query);
        if (!results) {
            results = this.filterCountries(query);
            this.cache.setCachedSearchResults(query, results);
        } else {
            console.log('Loaded search results from cache');
        }
        return results;
    }
}
