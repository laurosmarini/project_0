/**
 * CategoryManager - Handles category switching functionality
 * Manages Easy/Medium/Hard category tabs with smooth transitions
 */

export class CategoryManager {
    constructor(config = {}) {
        this.config = {
            container: '.categories-container',
            categories: ['Easy', 'Medium', 'Hard'],
            defaultCategory: 'Easy',
            activeClass: 'active',
            animationDuration: 300,
            ...config
        };

        this.currentCategory = this.config.defaultCategory;
        this.categoryButtons = new Map();
        this.categoryContents = new Map();
        this.initialized = false;

        // Bind methods
        this.handleCategoryClick = this.handleCategoryClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Initialize the category manager
     */
    async init() {
        try {
            this.container = document.querySelector(this.config.container);
            
            if (!this.container) {
                throw new Error(`Category container not found: ${this.config.container}`);
            }

            await this.createCategoryTabs();
            this.setupEventListeners();
            this.initialized = true;
            
            console.log('✅ CategoryManager initialized');
        } catch (error) {
            console.error('❌ CategoryManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create category tab buttons and content containers
     */
    async createCategoryTabs() {
        // Create tab navigation
        const tabNav = document.createElement('nav');
        tabNav.className = 'category-tabs';
        tabNav.setAttribute('role', 'tablist');
        tabNav.setAttribute('aria-label', 'Benchmark categories');

        // Create tab buttons
        this.config.categories.forEach((category, index) => {
            const button = this.createCategoryButton(category, index);
            this.categoryButtons.set(category, button);
            tabNav.appendChild(button);
        });

        // Create content containers
        const contentContainer = document.createElement('div');
        contentContainer.className = 'category-content-container';

        this.config.categories.forEach(category => {
            const content = this.createCategoryContent(category);
            this.categoryContents.set(category, content);
            contentContainer.appendChild(content);
        });

        // Add to DOM
        this.container.appendChild(tabNav);
        this.container.appendChild(contentContainer);

        // Set initial active category
        await this.setCategory(this.currentCategory);
    }

    /**
     * Create a category button
     */
    createCategoryButton(category, index) {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', `category-${category.toLowerCase()}`);
        button.setAttribute('aria-selected', 'false');
        button.setAttribute('tabindex', '-1');
        button.dataset.category = category;

        // Add difficulty indicators
        const indicator = document.createElement('span');
        indicator.className = 'difficulty-indicator';
        indicator.innerHTML = this.getDifficultyIndicator(category);
        button.appendChild(indicator);

        // Add keyboard navigation support
        button.addEventListener('keydown', this.handleKeyDown);

        return button;
    }

    /**
     * Create category content container
     */
    createCategoryContent(category) {
        const content = document.createElement('div');
        content.className = 'category-content';
        content.id = `category-${category.toLowerCase()}`;
        content.setAttribute('role', 'tabpanel');
        content.setAttribute('aria-labelledby', `tab-${category.toLowerCase()}`);
        content.setAttribute('tabindex', '0');
        content.hidden = true;

        // Add category-specific styling
        content.classList.add(`category-${category.toLowerCase()}`);

        // Create benchmark list container
        const benchmarkList = document.createElement('div');
        benchmarkList.className = 'benchmark-list';
        benchmarkList.dataset.category = category;
        content.appendChild(benchmarkList);

        return content;
    }

    /**
     * Get difficulty indicator HTML
     */
    getDifficultyIndicator(category) {
        const indicators = {
            Easy: '🟢 ●',
            Medium: '🟡 ●●',
            Hard: '🔴 ●●●'
        };
        return indicators[category] || '●';
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Category button clicks
        this.categoryButtons.forEach((button, category) => {
            button.addEventListener('click', () => this.handleCategoryClick(category));
        });

        // Listen for external category change requests
        document.addEventListener('category:set', (event) => {
            this.setCategory(event.detail.category);
        });
    }

    /**
     * Handle category button click
     */
    async handleCategoryClick(category) {
        if (category === this.currentCategory) {
            return;
        }

        await this.setCategory(category);
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyDown(event) {
        const { key } = event;
        const currentButton = event.target;
        const categories = Array.from(this.categoryButtons.keys());
        const currentIndex = categories.indexOf(currentButton.dataset.category);

        let newIndex = currentIndex;

        switch (key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : categories.length - 1;
                break;

            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                newIndex = currentIndex < categories.length - 1 ? currentIndex + 1 : 0;
                break;

            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;

            case 'End':
                event.preventDefault();
                newIndex = categories.length - 1;
                break;

            case 'Enter':
            case ' ':
                event.preventDefault();
                this.handleCategoryClick(currentButton.dataset.category);
                return;
        }

        if (newIndex !== currentIndex) {
            const newCategory = categories[newIndex];
            const newButton = this.categoryButtons.get(newCategory);
            newButton.focus();
        }
    }

    /**
     * Set active category with animation
     */
    async setCategory(category) {
        if (!this.config.categories.includes(category)) {
            throw new Error(`Invalid category: ${category}`);
        }

        if (category === this.currentCategory) {
            return;
        }

        const previousCategory = this.currentCategory;
        
        try {
            // Update button states
            this.updateButtonStates(category);
            
            // Animate content transition
            await this.animateContentTransition(previousCategory, category);
            
            this.currentCategory = category;

            // Dispatch category change event
            this.dispatchEvent('category:changed', {
                category,
                previousCategory
            });

            console.log(`📂 Category changed to: ${category}`);
            
        } catch (error) {
            console.error('❌ Failed to set category:', error);
            // Revert button states on error
            this.updateButtonStates(previousCategory);
            throw error;
        }
    }

    /**
     * Update button states
     */
    updateButtonStates(activeCategory) {
        this.categoryButtons.forEach((button, category) => {
            const isActive = category === activeCategory;
            
            button.classList.toggle(this.config.activeClass, isActive);
            button.setAttribute('aria-selected', isActive.toString());
            button.setAttribute('tabindex', isActive ? '0' : '-1');
        });
    }

    /**
     * Animate content transition
     */
    async animateContentTransition(fromCategory, toCategory) {
        const fromContent = this.categoryContents.get(fromCategory);
        const toContent = this.categoryContents.get(toCategory);

        if (!fromContent || !toContent) {
            return;
        }

        // Request animation from AnimationManager
        this.dispatchEvent('animation:request', {
            element: fromContent,
            animation: 'fadeOut',
            options: { duration: this.config.animationDuration / 2 }
        });

        // Wait for fade out to complete
        await this.wait(this.config.animationDuration / 2);

        // Hide previous content and show new content
        fromContent.hidden = true;
        toContent.hidden = false;

        // Animate new content in
        this.dispatchEvent('animation:request', {
            element: toContent,
            animation: 'fadeIn',
            options: { duration: this.config.animationDuration / 2 }
        });

        // Update ARIA attributes
        fromContent.setAttribute('aria-hidden', 'true');
        toContent.setAttribute('aria-hidden', 'false');
    }

    /**
     * Get current category
     */
    getCurrentCategory() {
        return this.currentCategory;
    }

    /**
     * Get category button element
     */
    getCategoryButton(category) {
        return this.categoryButtons.get(category);
    }

    /**
     * Get category content element
     */
    getCategoryContent(category) {
        return this.categoryContents.get(category);
    }

    /**
     * Get all categories
     */
    getCategories() {
        return [...this.config.categories];
    }

    /**
     * Add benchmark to category
     */
    addBenchmarkToCategory(category, benchmarkData) {
        const content = this.categoryContents.get(category);
        if (!content) {
            throw new Error(`Category not found: ${category}`);
        }

        const benchmarkList = content.querySelector('.benchmark-list');
        const benchmarkElement = this.createBenchmarkElement(benchmarkData);
        
        benchmarkList.appendChild(benchmarkElement);

        // Animate the new benchmark in
        this.dispatchEvent('animation:request', {
            element: benchmarkElement,
            animation: 'slideInDown',
            options: { duration: this.config.animationDuration }
        });
    }

    /**
     * Create benchmark element
     */
    createBenchmarkElement(data) {
        const element = document.createElement('div');
        element.className = 'benchmark-item';
        element.dataset.benchmarkId = data.id;
        
        element.innerHTML = `
            <div class="benchmark-header">
                <h3 class="benchmark-title">${data.title}</h3>
                <span class="benchmark-points">${data.points} pts</span>
            </div>
            <div class="benchmark-description">
                ${data.description}
            </div>
            <div class="benchmark-actions">
                <button class="btn-complete" data-benchmark-id="${data.id}">
                    Mark Complete
                </button>
                <button class="btn-details" data-benchmark-id="${data.id}">
                    View Details
                </button>
            </div>
        `;

        return element;
    }

    /**
     * Update category progress
     */
    updateProgress(category, completed, total) {
        const button = this.categoryButtons.get(category);
        if (!button) return;

        const progressText = `${completed}/${total}`;
        let progressElement = button.querySelector('.progress-text');
        
        if (!progressElement) {
            progressElement = document.createElement('span');
            progressElement.className = 'progress-text';
            button.appendChild(progressElement);
        }
        
        progressElement.textContent = progressText;
        
        // Add completion visual indicator
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        button.style.setProperty('--progress-percentage', `${percentage}%`);
        
        if (percentage === 100) {
            button.classList.add('completed');
        } else {
            button.classList.remove('completed');
        }
    }

    /**
     * Utility method to wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(type, detail = {}) {
        const event = new CustomEvent(type, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Destroy the category manager
     */
    destroy() {
        // Remove event listeners
        this.categoryButtons.forEach(button => {
            button.removeEventListener('click', this.handleCategoryClick);
            button.removeEventListener('keydown', this.handleKeyDown);
        });

        // Clear references
        this.categoryButtons.clear();
        this.categoryContents.clear();
        this.initialized = false;
    }
}