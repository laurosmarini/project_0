/**
 * SearchFilter - Handles search and filter functionality
 * Provides real-time search, filtering, and sorting capabilities
 */

export class SearchFilter {
    constructor(config = {}) {
        this.config = {
            searchInput: '.search-input',
            filterContainer: '.filter-container',
            debounceDelay: 250,
            minSearchLength: 2,
            highlightClass: 'search-highlight',
            ...config
        };

        this.searchQuery = '';
        this.activeFilters = new Set();
        this.sortBy = 'default';
        this.sortOrder = 'asc';
        
        this.searchResults = [];
        this.filteredItems = [];
        this.searchIndex = new Map();
        
        this.debounceTimer = null;
        this.initialized = false;

        // Bind methods
        this.handleSearchInput = this.handleSearchInput.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Initialize the search filter
     */
    async init() {
        try {
            await this.createSearchInterface();
            this.buildSearchIndex();
            this.setupEventListeners();
            this.initialized = true;

            console.log('✅ SearchFilter initialized');
        } catch (error) {
            console.error('❌ SearchFilter initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create search and filter interface
     */
    async createSearchInterface() {
        // Find or create search container
        let searchContainer = document.querySelector('.search-filter-container');
        
        if (!searchContainer) {
            searchContainer = document.createElement('div');
            searchContainer.className = 'search-filter-container';
            
            // Insert before first benchmark container
            const firstBenchmark = document.querySelector('.benchmark-list, .category-content');
            if (firstBenchmark) {
                firstBenchmark.parentNode.insertBefore(searchContainer, firstBenchmark);
            } else {
                document.body.appendChild(searchContainer);
            }
        }

        searchContainer.innerHTML = `
            <div class="search-section">
                <div class="search-input-container">
                    <div class="search-icon">🔍</div>
                    <input 
                        type="search" 
                        class="search-input" 
                        placeholder="Search benchmarks..." 
                        autocomplete="off"
                        aria-label="Search benchmarks"
                    >
                    <button class="search-clear-btn" aria-label="Clear search" title="Clear search">
                        ✕
                    </button>
                </div>
                
                <div class="search-results-info">
                    <span class="results-count">Showing all benchmarks</span>
                    <div class="search-actions">
                        <button class="btn-expand-all" title="Expand all sections">📖</button>
                        <button class="btn-collapse-all" title="Collapse all sections">📕</button>
                    </div>
                </div>
            </div>

            <div class="filter-section">
                <div class="filter-tabs">
                    <button class="filter-tab active" data-tab="category">Category</button>
                    <button class="filter-tab" data-tab="difficulty">Difficulty</button>
                    <button class="filter-tab" data-tab="status">Status</button>
                    <button class="filter-tab" data-tab="sort">Sort</button>
                </div>

                <div class="filter-content">
                    <div class="filter-panel active" data-panel="category">
                        <div class="filter-group">
                            <label class="filter-label">
                                <input type="checkbox" value="Easy" data-filter="category">
                                <span class="checkmark">Easy</span>
                                <span class="count" data-count="Easy">0</span>
                            </label>
                            <label class="filter-label">
                                <input type="checkbox" value="Medium" data-filter="category">
                                <span class="checkmark">Medium</span>
                                <span class="count" data-count="Medium">0</span>
                            </label>
                            <label class="filter-label">
                                <input type="checkbox" value="Hard" data-filter="category">
                                <span class="checkmark">Hard</span>
                                <span class="count" data-count="Hard">0</span>
                            </label>
                        </div>
                    </div>

                    <div class="filter-panel" data-panel="difficulty">
                        <div class="filter-group">
                            <label class="filter-label">
                                <input type="checkbox" value="beginner" data-filter="difficulty">
                                <span class="checkmark">🟢 Beginner</span>
                            </label>
                            <label class="filter-label">
                                <input type="checkbox" value="intermediate" data-filter="difficulty">
                                <span class="checkmark">🟡 Intermediate</span>
                            </label>
                            <label class="filter-label">
                                <input type="checkbox" value="advanced" data-filter="difficulty">
                                <span class="checkmark">🔴 Advanced</span>
                            </label>
                            <label class="filter-label">
                                <input type="checkbox" value="expert" data-filter="difficulty">
                                <span class="checkmark">🟣 Expert</span>
                            </label>
                        </div>
                    </div>

                    <div class="filter-panel" data-panel="status">
                        <div class="filter-group">
                            <label class="filter-label">
                                <input type="checkbox" value="completed" data-filter="status">
                                <span class="checkmark">✅ Completed</span>
                            </label>
                            <label class="filter-label">
                                <input type="checkbox" value="in-progress" data-filter="status">
                                <span class="checkmark">⏳ In Progress</span>
                            </label>
                            <label class="filter-label">
                                <input type="checkbox" value="not-started" data-filter="status">
                                <span class="checkmark">⭕ Not Started</span>
                            </label>
                        </div>
                    </div>

                    <div class="filter-panel" data-panel="sort">
                        <div class="sort-group">
                            <select class="sort-select" data-sort="field">
                                <option value="default">Default Order</option>
                                <option value="title">Title</option>
                                <option value="difficulty">Difficulty</option>
                                <option value="points">Points</option>
                                <option value="category">Category</option>
                                <option value="completed">Completion Status</option>
                            </select>
                            <select class="sort-select" data-sort="order">
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.searchInput = searchContainer.querySelector('.search-input');
        this.filterContainer = searchContainer.querySelector('.filter-section');
        this.resultsInfo = searchContainer.querySelector('.results-count');
    }

    /**
     * Build search index from DOM elements
     */
    buildSearchIndex() {
        this.searchIndex.clear();
        const benchmarkItems = document.querySelectorAll('[data-benchmark-id]');

        benchmarkItems.forEach(item => {
            const benchmarkId = item.dataset.benchmarkId;
            const title = item.querySelector('.benchmark-title')?.textContent || '';
            const description = item.querySelector('.benchmark-description')?.textContent || '';
            const category = item.closest('[data-category]')?.dataset.category || '';
            const points = item.querySelector('.benchmark-points')?.textContent || '';
            
            // Create searchable text
            const searchableText = `${title} ${description} ${category} ${points}`.toLowerCase();
            
            // Extract keywords
            const keywords = this.extractKeywords(searchableText);
            
            this.searchIndex.set(benchmarkId, {
                element: item,
                title,
                description,
                category,
                points: parseInt(points.replace(/\D/g, ''), 10) || 0,
                searchableText,
                keywords,
                difficulty: this.detectDifficulty(title, description),
                status: this.getCompletionStatus(item)
            });
        });

        this.updateFilterCounts();
        console.log(`🔍 Built search index with ${this.searchIndex.size} items`);
    }

    /**
     * Extract keywords from text
     */
    extractKeywords(text) {
        return text
            .split(/\s+/)
            .map(word => word.replace(/[^\w]/g, ''))
            .filter(word => word.length > 2)
            .slice(0, 20); // Limit keywords for performance
    }

    /**
     * Detect difficulty level from content
     */
    detectDifficulty(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        
        if (text.includes('expert') || text.includes('advanced') || text.includes('complex')) {
            return 'expert';
        } else if (text.includes('intermediate') || text.includes('medium')) {
            return 'intermediate';
        } else if (text.includes('hard') || text.includes('difficult')) {
            return 'advanced';
        } else {
            return 'beginner';
        }
    }

    /**
     * Get completion status of item
     */
    getCompletionStatus(element) {
        if (element.classList.contains('completed')) return 'completed';
        if (element.classList.contains('in-progress')) return 'in-progress';
        return 'not-started';
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleSearchInput);
            this.searchInput.addEventListener('keydown', this.handleKeyDown);
        }

        // Clear button
        const clearBtn = document.querySelector('.search-clear-btn');
        clearBtn?.addEventListener('click', () => {
            this.clearSearch();
        });

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchFilterTab(e.target.dataset.tab);
            });
        });

        // Filter checkboxes
        document.querySelectorAll('input[data-filter]').forEach(checkbox => {
            checkbox.addEventListener('change', this.handleFilterChange);
        });

        // Sort selects
        document.querySelectorAll('select[data-sort]').forEach(select => {
            select.addEventListener('change', this.handleSortChange);
        });

        // Expand/collapse buttons
        document.querySelector('.btn-expand-all')?.addEventListener('click', () => {
            this.dispatchEvent('sections:expand-all');
        });

        document.querySelector('.btn-collapse-all')?.addEventListener('click', () => {
            this.dispatchEvent('sections:collapse-all');
        });

        // Listen for external search requests
        document.addEventListener('search:set', (event) => {
            this.setQuery(event.detail.query);
        });

        document.addEventListener('filter:set', (event) => {
            this.setFilter(event.detail.filter, event.detail.value);
        });

        // Rebuild index when benchmarks change
        document.addEventListener('benchmark:added', () => {
            this.buildSearchIndex();
        });

        document.addEventListener('completion:changed', () => {
            this.buildSearchIndex();
            this.applyFilters();
        });
    }

    /**
     * Handle search input with debouncing
     */
    handleSearchInput(event) {
        const query = event.target.value.trim();

        // Clear previous debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Debounce search
        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, this.config.debounceDelay);

        // Update search query immediately for UI feedback
        this.searchQuery = query;
        this.updateSearchUI();
    }

    /**
     * Handle keyboard navigation in search
     */
    handleKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                this.clearSearch();
                break;
            case 'Enter':
                event.preventDefault();
                this.performSearch(this.searchInput.value.trim());
                break;
        }
    }

    /**
     * Handle filter changes
     */
    handleFilterChange(event) {
        const filter = event.target.dataset.filter;
        const value = event.target.value;
        const checked = event.target.checked;

        if (checked) {
            this.activeFilters.add(`${filter}:${value}`);
        } else {
            this.activeFilters.delete(`${filter}:${value}`);
        }

        this.applyFilters();
    }

    /**
     * Handle sort changes
     */
    handleSortChange(event) {
        const sortType = event.target.dataset.sort;
        const value = event.target.value;

        if (sortType === 'field') {
            this.sortBy = value;
        } else if (sortType === 'order') {
            this.sortOrder = value;
        }

        this.applySorting();
    }

    /**
     * Perform search
     */
    performSearch(query) {
        this.searchQuery = query;
        
        if (!query || query.length < this.config.minSearchLength) {
            this.clearSearchResults();
            return;
        }

        const results = this.searchBenchmarks(query);
        this.displaySearchResults(results);
        this.applyFilters();

        // Dispatch search event
        this.dispatchEvent('search:performed', {
            query,
            results: results.length
        });
    }

    /**
     * Search benchmarks
     */
    searchBenchmarks(query) {
        const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        const results = [];

        for (const [benchmarkId, data] of this.searchIndex) {
            const score = this.calculateSearchScore(data, queryTerms);
            
            if (score > 0) {
                results.push({
                    benchmarkId,
                    score,
                    data,
                    highlights: this.findHighlights(data, queryTerms)
                });
            }
        }

        // Sort by relevance score
        results.sort((a, b) => b.score - a.score);
        
        return results;
    }

    /**
     * Calculate search score
     */
    calculateSearchScore(data, queryTerms) {
        let score = 0;
        
        queryTerms.forEach(term => {
            // Title matches (highest priority)
            if (data.title.toLowerCase().includes(term)) {
                score += data.title.toLowerCase().indexOf(term) === 0 ? 100 : 50;
            }
            
            // Description matches
            if (data.description.toLowerCase().includes(term)) {
                score += 25;
            }
            
            // Category matches
            if (data.category.toLowerCase().includes(term)) {
                score += 20;
            }
            
            // Keyword matches
            if (data.keywords.some(keyword => keyword.includes(term))) {
                score += 10;
            }
            
            // Fuzzy matching for typos
            const fuzzyScore = this.fuzzyMatch(term, data.searchableText);
            score += fuzzyScore;
        });

        return score;
    }

    /**
     * Simple fuzzy matching for typos
     */
    fuzzyMatch(term, text) {
        if (term.length < 3) return 0;
        
        const words = text.split(/\s+/);
        let bestScore = 0;
        
        words.forEach(word => {
            if (word.length >= term.length - 1 && word.length <= term.length + 1) {
                const distance = this.levenshteinDistance(term, word);
                if (distance <= 1) {
                    bestScore = Math.max(bestScore, 5 - distance);
                }
            }
        });
        
        return bestScore;
    }

    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Find text highlights
     */
    findHighlights(data, queryTerms) {
        const highlights = [];
        
        queryTerms.forEach(term => {
            // Find in title
            const titleIndex = data.title.toLowerCase().indexOf(term);
            if (titleIndex !== -1) {
                highlights.push({
                    field: 'title',
                    start: titleIndex,
                    end: titleIndex + term.length
                });
            }
            
            // Find in description
            const descIndex = data.description.toLowerCase().indexOf(term);
            if (descIndex !== -1) {
                highlights.push({
                    field: 'description',
                    start: descIndex,
                    end: descIndex + term.length
                });
            }
        });
        
        return highlights;
    }

    /**
     * Display search results
     */
    displaySearchResults(results) {
        this.searchResults = results;
        
        // Hide all benchmarks first
        this.searchIndex.forEach(({ element }) => {
            element.style.display = 'none';
            this.removeHighlights(element);
        });
        
        // Show matching benchmarks with highlights
        results.forEach(({ data, highlights }) => {
            data.element.style.display = 'block';
            this.applyHighlights(data.element, highlights);
        });
        
        this.updateResultsInfo();
        
        // Dispatch search results event
        this.dispatchEvent('search:filtered', {
            query: this.searchQuery,
            results: results.map(r => r.data.element),
            count: results.length
        });
    }

    /**
     * Apply text highlights
     */
    applyHighlights(element, highlights) {
        highlights.forEach(highlight => {
            const targetElement = element.querySelector(`.benchmark-${highlight.field}`);
            if (!targetElement) return;
            
            const text = targetElement.textContent;
            const highlightedText = 
                text.slice(0, highlight.start) +
                `<mark class="${this.config.highlightClass}">` +
                text.slice(highlight.start, highlight.end) +
                '</mark>' +
                text.slice(highlight.end);
            
            targetElement.innerHTML = highlightedText;
        });
    }

    /**
     * Remove text highlights
     */
    removeHighlights(element) {
        const highlighted = element.querySelectorAll(`.${this.config.highlightClass}`);
        highlighted.forEach(mark => {
            mark.outerHTML = mark.textContent;
        });
    }

    /**
     * Apply filters
     */
    applyFilters() {
        let filteredItems = this.searchResults.length > 0 ? this.searchResults : 
            Array.from(this.searchIndex.values());

        // Apply active filters
        this.activeFilters.forEach(filter => {
            const [type, value] = filter.split(':');
            filteredItems = filteredItems.filter(item => {
                const data = item.data || item;
                
                switch (type) {
                    case 'category':
                        return data.category === value;
                    case 'difficulty':
                        return data.difficulty === value;
                    case 'status':
                        return data.status === value;
                    default:
                        return true;
                }
            });
        });

        this.filteredItems = filteredItems;
        this.displayFilteredResults();
        this.applySorting();
    }

    /**
     * Display filtered results
     */
    displayFilteredResults() {
        // Hide all items
        this.searchIndex.forEach(({ element }) => {
            element.style.display = 'none';
        });

        // Show filtered items
        this.filteredItems.forEach(item => {
            const element = item.data ? item.data.element : item.element;
            element.style.display = 'block';
        });

        this.updateResultsInfo();
    }

    /**
     * Apply sorting
     */
    applySorting() {
        if (this.sortBy === 'default') return;

        const items = [...this.filteredItems];
        
        items.sort((a, b) => {
            const dataA = a.data || a;
            const dataB = b.data || b;
            
            let valueA, valueB;
            
            switch (this.sortBy) {
                case 'title':
                    valueA = dataA.title.toLowerCase();
                    valueB = dataB.title.toLowerCase();
                    break;
                case 'points':
                    valueA = dataA.points;
                    valueB = dataB.points;
                    break;
                case 'category':
                    valueA = dataA.category.toLowerCase();
                    valueB = dataB.category.toLowerCase();
                    break;
                case 'difficulty':
                    const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2, 'expert': 3 };
                    valueA = difficultyOrder[dataA.difficulty] || 0;
                    valueB = difficultyOrder[dataB.difficulty] || 0;
                    break;
                case 'completed':
                    const statusOrder = { 'completed': 2, 'in-progress': 1, 'not-started': 0 };
                    valueA = statusOrder[dataA.status] || 0;
                    valueB = statusOrder[dataB.status] || 0;
                    break;
                default:
                    return 0;
            }
            
            let comparison = 0;
            if (valueA < valueB) comparison = -1;
            if (valueA > valueB) comparison = 1;
            
            return this.sortOrder === 'desc' ? -comparison : comparison;
        });

        // Reorder DOM elements
        this.reorderElements(items);
    }

    /**
     * Reorder DOM elements
     */
    reorderElements(sortedItems) {
        const containers = new Map();
        
        // Group by container
        sortedItems.forEach(item => {
            const element = item.data ? item.data.element : item.element;
            const container = element.parentNode;
            
            if (!containers.has(container)) {
                containers.set(container, []);
            }
            containers.get(container).push(element);
        });
        
        // Reorder within each container
        containers.forEach((elements, container) => {
            elements.forEach((element, index) => {
                container.appendChild(element);
            });
        });
    }

    /**
     * Switch filter tab
     */
    switchFilterTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update panels
        document.querySelectorAll('.filter-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === tabName);
        });
    }

    /**
     * Update filter counts
     */
    updateFilterCounts() {
        // Update category counts
        const categoryCounts = {};
        this.searchIndex.forEach(({ category }) => {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        Object.entries(categoryCounts).forEach(([category, count]) => {
            const countElement = document.querySelector(`[data-count="${category}"]`);
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }

    /**
     * Update results info
     */
    updateResultsInfo() {
        if (!this.resultsInfo) return;
        
        const total = this.searchIndex.size;
        const showing = this.filteredItems.length;
        
        let text = '';
        if (this.searchQuery) {
            text = `Showing ${showing} of ${total} results for "${this.searchQuery}"`;
        } else if (this.activeFilters.size > 0) {
            text = `Showing ${showing} of ${total} benchmarks (filtered)`;
        } else {
            text = `Showing all ${total} benchmarks`;
        }
        
        this.resultsInfo.textContent = text;
    }

    /**
     * Clear search
     */
    clearSearch() {
        this.searchQuery = '';
        this.searchInput.value = '';
        this.clearSearchResults();
        this.updateSearchUI();
        
        this.dispatchEvent('search:cleared');
    }

    /**
     * Clear search results
     */
    clearSearchResults() {
        this.searchResults = [];
        
        // Show all items
        this.searchIndex.forEach(({ element }) => {
            element.style.display = 'block';
            this.removeHighlights(element);
        });
        
        // Reapply filters if any
        if (this.activeFilters.size > 0) {
            this.applyFilters();
        } else {
            this.filteredItems = Array.from(this.searchIndex.values());
            this.updateResultsInfo();
        }
    }

    /**
     * Update search UI
     */
    updateSearchUI() {
        const clearBtn = document.querySelector('.search-clear-btn');
        if (clearBtn) {
            clearBtn.style.display = this.searchQuery ? 'block' : 'none';
        }
    }

    /**
     * Set search query programmatically
     */
    async setQuery(query) {
        this.searchInput.value = query;
        await this.performSearch(query);
    }

    /**
     * Set filter programmatically
     */
    setFilter(filterType, value, checked = true) {
        const checkbox = document.querySelector(`input[data-filter="${filterType}"][value="${value}"]`);
        if (checkbox) {
            checkbox.checked = checked;
            this.handleFilterChange({ target: checkbox });
        }
    }

    /**
     * Filter by category (called from CategoryManager)
     */
    filterByCategory(category) {
        // Clear existing category filters
        const categoryFilters = Array.from(this.activeFilters).filter(f => f.startsWith('category:'));
        categoryFilters.forEach(f => this.activeFilters.delete(f));
        
        // Add new category filter
        this.activeFilters.add(`category:${category}`);
        
        // Update checkbox
        const checkbox = document.querySelector(`input[data-filter="category"][value="${category}"]`);
        if (checkbox) {
            // Clear other category checkboxes
            document.querySelectorAll('input[data-filter="category"]').forEach(cb => {
                cb.checked = false;
            });
            checkbox.checked = true;
        }
        
        this.applyFilters();
    }

    /**
     * Get current search query
     */
    getCurrentQuery() {
        return this.searchQuery;
    }

    /**
     * Get active filters
     */
    getActiveFilters() {
        return Array.from(this.activeFilters);
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(type, detail = {}) {
        const event = new CustomEvent(type, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Destroy the search filter
     */
    destroy() {
        // Clear debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Clear search index
        this.searchIndex.clear();
        
        // Reset filters
        this.activeFilters.clear();
        
        this.initialized = false;
    }
}