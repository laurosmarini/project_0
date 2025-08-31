/**
 * CollapsibleSections - Handles collapsible benchmark sections
 * Provides smooth expand/collapse animations and state management
 */

export class CollapsibleSections {
    constructor(config = {}) {
        this.config = {
            sectionSelector: '.benchmark-section',
            headerSelector: '.section-header',
            contentSelector: '.section-content',
            toggleSelector: '.section-toggle',
            animationDuration: 300,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            expandedClass: 'expanded',
            collapsingClass: 'collapsing',
            expandingClass: 'expanding',
            ...config
        };

        this.sections = new Map();
        this.expandedSections = new Set();
        this.animatingSections = new Set();
        this.initialized = false;

        // Bind methods
        this.handleToggleClick = this.handleToggleClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleFocusIn = this.handleFocusIn.bind(this);
    }

    /**
     * Initialize collapsible sections
     */
    async init() {
        try {
            await this.findAndSetupSections();
            this.setupEventListeners();
            this.initialized = true;

            console.log(`✅ CollapsibleSections initialized with ${this.sections.size} sections`);
        } catch (error) {
            console.error('❌ CollapsibleSections initialization failed:', error);
            throw error;
        }
    }

    /**
     * Find and set up all sections
     */
    async findAndSetupSections() {
        const existingSections = document.querySelectorAll(this.config.sectionSelector);
        
        if (existingSections.length === 0) {
            // Create sections from benchmark categories
            await this.createSectionsFromContent();
        } else {
            // Use existing sections
            existingSections.forEach(section => this.setupSection(section));
        }
    }

    /**
     * Create sections from existing content
     */
    async createSectionsFromContent() {
        const categories = ['Easy', 'Medium', 'Hard'];
        const mainContainer = document.querySelector('.content') || document.body;

        categories.forEach(category => {
            // Find benchmarks for this category
            const benchmarks = document.querySelectorAll(`[data-category="${category}"] [data-benchmark-id]`);
            
            if (benchmarks.length > 0) {
                const section = this.createSection(category, benchmarks);
                const categoryContainer = document.querySelector(`[data-category="${category}"]`);
                
                if (categoryContainer) {
                    categoryContainer.appendChild(section);
                } else {
                    mainContainer.appendChild(section);
                }
            }
        });
    }

    /**
     * Create a section element
     */
    createSection(title, benchmarks) {
        const section = document.createElement('div');
        section.className = 'benchmark-section';
        section.dataset.sectionId = title.toLowerCase();
        
        const sectionId = `section-${title.toLowerCase()}`;
        const contentId = `content-${title.toLowerCase()}`;

        section.innerHTML = `
            <div class="section-header" role="button" tabindex="0" aria-expanded="true" aria-controls="${contentId}">
                <h3 class="section-title">${title} Benchmarks</h3>
                <div class="section-info">
                    <span class="section-count">${benchmarks.length} items</span>
                    <span class="section-progress">0/${benchmarks.length} completed</span>
                </div>
                <button class="section-toggle" aria-label="Toggle section">
                    <span class="toggle-icon">▼</span>
                </button>
            </div>
            <div class="section-content" id="${contentId}" aria-labelledby="${sectionId}">
                <div class="section-inner">
                    <!-- Benchmarks will be moved here -->
                </div>
            </div>
        `;

        // Move benchmarks into section
        const sectionInner = section.querySelector('.section-inner');
        benchmarks.forEach(benchmark => {
            sectionInner.appendChild(benchmark.cloneNode(true));
        });

        this.setupSection(section);
        return section;
    }

    /**
     * Set up a single section
     */
    setupSection(sectionElement) {
        const sectionId = sectionElement.dataset.sectionId || 
                         sectionElement.querySelector('.section-title')?.textContent.toLowerCase().replace(/\s+/g, '-') || 
                         `section-${this.sections.size}`;
        
        const header = sectionElement.querySelector(this.config.headerSelector) || 
                      sectionElement.querySelector('.section-header');
        const content = sectionElement.querySelector(this.config.contentSelector) || 
                       sectionElement.querySelector('.section-content');
        const toggle = sectionElement.querySelector(this.config.toggleSelector) || 
                      sectionElement.querySelector('.section-toggle');

        if (!header || !content) {
            console.warn('Section missing required elements:', sectionElement);
            return;
        }

        // Ensure proper ARIA attributes
        if (!header.hasAttribute('role')) {
            header.setAttribute('role', 'button');
        }
        if (!header.hasAttribute('tabindex')) {
            header.setAttribute('tabindex', '0');
        }
        if (!header.hasAttribute('aria-expanded')) {
            header.setAttribute('aria-expanded', 'true');
        }
        
        const contentId = content.id || `content-${sectionId}`;
        content.id = contentId;
        header.setAttribute('aria-controls', contentId);

        // Store section data
        const sectionData = {
            id: sectionId,
            element: sectionElement,
            header,
            content,
            toggle,
            isExpanded: true,
            originalHeight: null,
            benchmarks: this.getBenchmarksInSection(sectionElement)
        };

        this.sections.set(sectionId, sectionData);
        this.expandedSections.add(sectionId);

        // Calculate and set initial state
        this.measureSection(sectionData);
        this.updateSectionProgress(sectionId);
    }

    /**
     * Get benchmarks within a section
     */
    getBenchmarksInSection(sectionElement) {
        return Array.from(sectionElement.querySelectorAll('[data-benchmark-id]'));
    }

    /**
     * Measure section content height
     */
    measureSection(sectionData) {
        const { content } = sectionData;
        
        // Temporarily expand to measure
        const wasHidden = content.style.display === 'none';
        if (wasHidden) {
            content.style.display = 'block';
            content.style.height = 'auto';
        }

        sectionData.originalHeight = content.scrollHeight;

        if (wasHidden) {
            content.style.display = 'none';
            content.style.height = '0px';
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Delegate click events for section headers
        document.addEventListener('click', (event) => {
            const header = event.target.closest(this.config.headerSelector);
            if (header) {
                const section = header.closest(this.config.sectionSelector);
                if (section) {
                    const sectionId = this.getSectionId(section);
                    if (sectionId) {
                        this.handleToggleClick(sectionId, event);
                    }
                }
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('focusin', this.handleFocusIn);

        // Listen for external commands
        document.addEventListener('sections:expand-all', () => {
            this.expandAll();
        });

        document.addEventListener('sections:collapse-all', () => {
            this.collapseAll();
        });

        document.addEventListener('section:toggle', (event) => {
            this.toggle(event.detail.sectionId);
        });

        document.addEventListener('section:expand', (event) => {
            this.expand(event.detail.sectionId);
        });

        document.addEventListener('section:collapse', (event) => {
            this.collapse(event.detail.sectionId);
        });

        // Listen for search results to update visibility
        document.addEventListener('search:filtered', (event) => {
            this.updateVisibleSections(event.detail.results);
        });

        // Listen for completion changes to update progress
        document.addEventListener('completion:changed', (event) => {
            this.updateAllSectionProgress();
        });

        // Resize observer for dynamic content changes
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver((entries) => {
                entries.forEach(entry => {
                    const section = entry.target.closest(this.config.sectionSelector);
                    if (section) {
                        const sectionId = this.getSectionId(section);
                        const sectionData = this.sections.get(sectionId);
                        if (sectionData) {
                            this.measureSection(sectionData);
                        }
                    }
                });
            });

            // Observe all section contents
            this.sections.forEach(({ content }) => {
                this.resizeObserver.observe(content);
            });
        }
    }

    /**
     * Get section ID from element
     */
    getSectionId(sectionElement) {
        // Try dataset first
        if (sectionElement.dataset.sectionId) {
            return sectionElement.dataset.sectionId;
        }

        // Try to find from sections map
        for (const [id, data] of this.sections) {
            if (data.element === sectionElement) {
                return id;
            }
        }

        return null;
    }

    /**
     * Handle toggle click
     */
    async handleToggleClick(sectionId, event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.animatingSections.has(sectionId)) {
            return; // Prevent multiple animations
        }

        await this.toggle(sectionId);
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyDown(event) {
        const header = event.target.closest(this.config.headerSelector);
        if (!header) return;

        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                const section = header.closest(this.config.sectionSelector);
                const sectionId = this.getSectionId(section);
                if (sectionId) {
                    this.toggle(sectionId);
                }
                break;

            case 'ArrowDown':
                event.preventDefault();
                this.focusNextSection(header);
                break;

            case 'ArrowUp':
                event.preventDefault();
                this.focusPreviousSection(header);
                break;

            case 'Home':
                event.preventDefault();
                this.focusFirstSection();
                break;

            case 'End':
                event.preventDefault();
                this.focusLastSection();
                break;
        }
    }

    /**
     * Handle focus events
     */
    handleFocusIn(event) {
        const header = event.target.closest(this.config.headerSelector);
        if (header) {
            // Ensure section is visible when focused
            header.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Focus navigation methods
     */
    focusNextSection(currentHeader) {
        const headers = Array.from(document.querySelectorAll(this.config.headerSelector));
        const currentIndex = headers.indexOf(currentHeader);
        const nextHeader = headers[currentIndex + 1];
        if (nextHeader) {
            nextHeader.focus();
        }
    }

    focusPreviousSection(currentHeader) {
        const headers = Array.from(document.querySelectorAll(this.config.headerSelector));
        const currentIndex = headers.indexOf(currentHeader);
        const prevHeader = headers[currentIndex - 1];
        if (prevHeader) {
            prevHeader.focus();
        }
    }

    focusFirstSection() {
        const firstHeader = document.querySelector(this.config.headerSelector);
        if (firstHeader) {
            firstHeader.focus();
        }
    }

    focusLastSection() {
        const headers = document.querySelectorAll(this.config.headerSelector);
        const lastHeader = headers[headers.length - 1];
        if (lastHeader) {
            lastHeader.focus();
        }
    }

    /**
     * Toggle section
     */
    async toggle(sectionId) {
        const sectionData = this.sections.get(sectionId);
        if (!sectionData) {
            console.warn('Section not found:', sectionId);
            return;
        }

        if (sectionData.isExpanded) {
            await this.collapse(sectionId);
        } else {
            await this.expand(sectionId);
        }
    }

    /**
     * Expand section
     */
    async expand(sectionId) {
        const sectionData = this.sections.get(sectionId);
        if (!sectionData || sectionData.isExpanded || this.animatingSections.has(sectionId)) {
            return;
        }

        this.animatingSections.add(sectionId);
        const { element, header, content, toggle } = sectionData;

        try {
            // Measure content if not already done
            if (!sectionData.originalHeight) {
                this.measureSection(sectionData);
            }

            // Set initial state
            element.classList.add(this.config.expandingClass);
            content.style.height = '0px';
            content.style.overflow = 'hidden';

            // Update ARIA and visual states
            header.setAttribute('aria-expanded', 'true');
            if (toggle) {
                toggle.querySelector('.toggle-icon').textContent = '▼';
                toggle.setAttribute('aria-label', 'Collapse section');
            }

            // Animate expansion
            await this.animateHeight(content, 0, sectionData.originalHeight);

            // Final state
            content.style.height = 'auto';
            content.style.overflow = '';
            element.classList.remove(this.config.expandingClass);
            element.classList.add(this.config.expandedClass);

            sectionData.isExpanded = true;
            this.expandedSections.add(sectionId);

            // Dispatch event
            this.dispatchEvent('section:expanded', { sectionId, element });

        } catch (error) {
            console.error('Failed to expand section:', error);
        } finally {
            this.animatingSections.delete(sectionId);
        }
    }

    /**
     * Collapse section
     */
    async collapse(sectionId) {
        const sectionData = this.sections.get(sectionId);
        if (!sectionData || !sectionData.isExpanded || this.animatingSections.has(sectionId)) {
            return;
        }

        this.animatingSections.add(sectionId);
        const { element, header, content, toggle } = sectionData;

        try {
            // Set initial state
            element.classList.add(this.config.collapsingClass);
            element.classList.remove(this.config.expandedClass);
            
            const currentHeight = content.scrollHeight;
            content.style.height = currentHeight + 'px';
            content.style.overflow = 'hidden';

            // Update ARIA and visual states
            header.setAttribute('aria-expanded', 'false');
            if (toggle) {
                toggle.querySelector('.toggle-icon').textContent = '▶';
                toggle.setAttribute('aria-label', 'Expand section');
            }

            // Animate collapse
            await this.animateHeight(content, currentHeight, 0);

            // Final state
            content.style.height = '0px';
            element.classList.remove(this.config.collapsingClass);

            sectionData.isExpanded = false;
            this.expandedSections.delete(sectionId);

            // Dispatch event
            this.dispatchEvent('section:collapsed', { sectionId, element });

        } catch (error) {
            console.error('Failed to collapse section:', error);
        } finally {
            this.animatingSections.delete(sectionId);
        }
    }

    /**
     * Animate height change
     */
    animateHeight(element, fromHeight, toHeight) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const duration = this.config.animationDuration;
            const heightDiff = toHeight - fromHeight;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Apply easing
                const easedProgress = this.cubicBezier(progress, 0.25, 0.46, 0.45, 0.94);
                const currentHeight = fromHeight + (heightDiff * easedProgress);
                
                element.style.height = Math.max(0, currentHeight) + 'px';

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    /**
     * Cubic bezier easing function
     */
    cubicBezier(t, x1, y1, x2, y2) {
        // Simplified cubic-bezier implementation
        return t * t * (3 - 2 * t);
    }

    /**
     * Expand all sections
     */
    async expandAll() {
        const promises = [];
        
        for (const sectionId of this.sections.keys()) {
            promises.push(this.expand(sectionId));
        }
        
        await Promise.all(promises);
        this.dispatchEvent('sections:all-expanded');
    }

    /**
     * Collapse all sections
     */
    async collapseAll() {
        const promises = [];
        
        for (const sectionId of this.sections.keys()) {
            promises.push(this.collapse(sectionId));
        }
        
        await Promise.all(promises);
        this.dispatchEvent('sections:all-collapsed');
    }

    /**
     * Update visible sections based on search/filter results
     */
    updateVisibleSections(visibleElements = []) {
        const visibleSections = new Set();

        // Determine which sections have visible content
        if (visibleElements.length > 0) {
            visibleElements.forEach(element => {
                const section = element.closest(this.config.sectionSelector);
                if (section) {
                    const sectionId = this.getSectionId(section);
                    if (sectionId) {
                        visibleSections.add(sectionId);
                    }
                }
            });

            // Hide sections with no visible content
            for (const [sectionId, sectionData] of this.sections) {
                const shouldShow = visibleSections.has(sectionId);
                sectionData.element.style.display = shouldShow ? 'block' : 'none';
                
                // Auto-expand sections with search results
                if (shouldShow && !sectionData.isExpanded) {
                    this.expand(sectionId);
                }
            }
        } else {
            // Show all sections
            for (const sectionData of this.sections.values()) {
                sectionData.element.style.display = 'block';
            }
        }
    }

    /**
     * Update section progress
     */
    updateSectionProgress(sectionId) {
        const sectionData = this.sections.get(sectionId);
        if (!sectionData) return;

        const benchmarks = this.getBenchmarksInSection(sectionData.element);
        const completed = benchmarks.filter(b => b.classList.contains('completed')).length;
        const total = benchmarks.length;

        // Update progress display
        const progressElement = sectionData.element.querySelector('.section-progress');
        if (progressElement) {
            progressElement.textContent = `${completed}/${total} completed`;
        }

        // Update count
        const countElement = sectionData.element.querySelector('.section-count');
        if (countElement) {
            countElement.textContent = `${total} items`;
        }

        // Add visual indicator for completion
        const completionRate = total > 0 ? completed / total : 0;
        sectionData.element.style.setProperty('--completion-rate', `${completionRate * 100}%`);
        
        if (completionRate === 1) {
            sectionData.element.classList.add('fully-completed');
        } else {
            sectionData.element.classList.remove('fully-completed');
        }
    }

    /**
     * Update all section progress
     */
    updateAllSectionProgress() {
        for (const sectionId of this.sections.keys()) {
            this.updateSectionProgress(sectionId);
        }
    }

    /**
     * Get expanded sections
     */
    getExpandedSections() {
        return Array.from(this.expandedSections);
    }

    /**
     * Restore expanded sections
     */
    async restoreExpandedSections(expandedSectionIds) {
        try {
            // First, collapse all sections
            await this.collapseAll();
            
            // Then expand the specified sections
            const promises = expandedSectionIds
                .filter(id => this.sections.has(id))
                .map(id => this.expand(id));
            
            await Promise.all(promises);
            
            console.log('✅ Restored expanded sections:', expandedSectionIds);
        } catch (error) {
            console.error('❌ Failed to restore expanded sections:', error);
        }
    }

    /**
     * Add new section
     */
    addSection(title, benchmarks, index = -1) {
        const section = this.createSection(title, benchmarks);
        
        // Insert at specified index or append
        const container = document.querySelector('.content') || document.body;
        if (index >= 0 && index < container.children.length) {
            container.insertBefore(section, container.children[index]);
        } else {
            container.appendChild(section);
        }

        // Animate the new section in
        this.dispatchEvent('animation:request', {
            element: section,
            animation: 'slideInDown',
            options: { duration: this.config.animationDuration }
        });

        return section;
    }

    /**
     * Remove section
     */
    async removeSection(sectionId) {
        const sectionData = this.sections.get(sectionId);
        if (!sectionData) return;

        // Animate out
        await new Promise(resolve => {
            this.dispatchEvent('animation:request', {
                element: sectionData.element,
                animation: 'slideOutUp',
                options: { 
                    duration: this.config.animationDuration,
                    onComplete: resolve
                }
            });
        });

        // Remove from DOM and maps
        sectionData.element.remove();
        this.sections.delete(sectionId);
        this.expandedSections.delete(sectionId);
        
        // Clean up resize observer
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(sectionData.content);
        }
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(type, detail = {}) {
        const event = new CustomEvent(type, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Destroy collapsible sections
     */
    destroy() {
        // Clean up resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        // Clear animation timers
        this.animatingSections.clear();

        // Clear data
        this.sections.clear();
        this.expandedSections.clear();
        
        this.initialized = false;
    }
}