
class CountrySearchApp {
    constructor() {
        this.input = document.getElementById('q');
        this.button = document.getElementById('btn');
        this.buttonAll = document.getElementById('all');
        this.statusEl = document.getElementById('status');
        this.resultsEl = document.getElementById('results');
        this.pagerEl = document.getElementById('pager');

        this.countryService = new CountryService();
        this.cache = new CacheManager();
        this.ui = new UIRenderer(this.resultsEl);

        this.pageSize = 30;    
        this.currentPage = 1;   
        this.currentDataset = [];

        this.ui.renderFavorites(this.cache.getFavorites());
        this.init();
    }

    init() {
        this.setupEventListeners();
        document.addEventListener('DOMContentLoaded', () => this.loadCountries());
    }

    setupEventListeners() {
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });
        this.button.addEventListener('click', () => this.search());
        this.buttonAll.addEventListener('click', () => this.displayAllCountries());

        this.pagerEl.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            if (action === 'prev') this.goToPage(this.currentPage - 1);
            if (action === 'next') this.goToPage(this.currentPage + 1);
            if (action === 'page') {
                const page = parseInt(btn.getAttribute('data-page'), 10);
                this.goToPage(page);
            }
        });
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

    displayAllCountries() {
        const countries = this.cache.getCachedCountries();
        this.currentDataset = countries;  
        this.currentPage = 1;            
        this.renderPaginated();           
    }

    renderPaginated() {
        const total = this.currentDataset.length;
        if (total === 0) {
            this.ui.clear();
            this.renderPager({ total, totalPages: 0, currentPage: 0 });
            this.updateStatus('Nothing to show.');
            return;
        }

        const totalPages = Math.ceil(total / this.pageSize);
        if (this.currentPage < 1) this.currentPage = 1;
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        const startIdx = (this.currentPage - 1) * this.pageSize;
        const endIdx = Math.min(startIdx + this.pageSize, total);
        const slice = this.currentDataset.slice(startIdx, endIdx);

        const hasResults = this.ui.showAllCountries(slice); 
        if (hasResults) {
            this.updateStatus(`${total} rezultate • Pagina ${this.currentPage}/${totalPages}`);
        } else {
            this.updateStatus('Nothing to show.');
        }

        this.renderPager({ total, totalPages, currentPage: this.currentPage });
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderPaginated();
    }

    search() {
        const q = this.input.value.trim();
        if (q.length < 3) {
            this.updateStatus('Type at least 3 character.');
            return;
        }

        const results = this.countryService.search(q);
        this.currentDataset = results; 
        this.currentPage = 1;
        this.renderPaginated();

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

        const favorites = this.cache.getFavorites(countryName);
        this.ui.renderFavorites(favorites);
    }

    renderPager({ total, totalPages, currentPage }) {
        if (!this.pagerEl) return;

        if (totalPages <= 1) {
            this.pagerEl.innerHTML = ''; 
            return;
        }

        const pageButtonsHtml = this.buildPageButtons(totalPages, currentPage);

        this.pagerEl.innerHTML = `
            <div class="pager">
                <button data-action="prev" ${currentPage === 1 ? 'disabled' : ''}>&laquo; Prev</button>
                <div class="pages">
                    ${pageButtonsHtml}
                </div>
                <button data-action="next" ${currentPage === totalPages ? 'disabled' : ''}>Next &raquo;</button>
            </div>
        `;
    }

    buildPageButtons(totalPages, currentPage) {
        const pages = new Set([1, 2, totalPages - 1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
        const validPages = [...pages].filter(p => p >= 1 && p <= totalPages).sort((a,b) => a - b);

        let html = '';
        let prev = 0;
        for (const p of validPages) {
            if (p - prev > 1) {
                if (prev !== 0) {
                    html += `<span class="ellipsis">…</span>`;
                }
            }
            html += `
                <button data-action="page" data-page="${p}" class="${p === currentPage ? 'active' : ''}">
                    ${p}
                </button>
            `;
            prev = p;
        }
        return html;
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CountrySearchApp();
    app.loadCountries();
});
