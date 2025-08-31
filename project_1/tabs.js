class TabSwitcher {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.activeTab = 'tab1';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAccessibility();
        this.showTab(this.activeTab);
    }

    bindEvents() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                this.showTab(tabId);
            });

            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const tabId = e.target.getAttribute('data-tab');
                    this.showTab(tabId);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key >= '1' && e.key <= '7') {
                e.preventDefault();
                const tabNumber = parseInt(e.key);
                this.showTab(`tab${tabNumber}`);
            }
        });
    }

    setupAccessibility() {
        this.tabButtons.forEach((button, index) => {
            const tabId = button.getAttribute('data-tab');
            const content = document.getElementById(tabId);
            
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', button.classList.contains('active') ? 'true' : 'false');
            button.setAttribute('aria-controls', tabId);
            
            if (content) {
                content.setAttribute('role', 'tabpanel');
                content.setAttribute('aria-labelledby', button.id || `tab-btn-${index}`);
                content.setAttribute('tabindex', '0');
            }

            if (!button.id) {
                button.id = `tab-btn-${index}`;
            }
        });
    }

    showTab(tabId) {
        if (!tabId || !this.isValidTab(tabId)) {
            console.warn(`Invalid tab ID: ${tabId}`);
            return;
        }

        this.updateActiveStates(tabId);
        this.updateContentVisibility(tabId);
        this.updateURLHash(tabId);
        this.activeTab = tabId;

        this.dispatchTabChangeEvent(tabId);
    }

    isValidTab(tabId) {
        return Array.from(this.tabButtons).some(btn => 
            btn.getAttribute('data-tab') === tabId
        );
    }

    updateActiveStates(tabId) {
        this.tabButtons.forEach(button => {
            const isActive = button.getAttribute('data-tab') === tabId;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            button.setAttribute('tabindex', isActive ? '0' : '-1');
        });
    }

    updateContentVisibility(tabId) {
        this.tabContents.forEach(content => {
            const isVisible = content.id === tabId;
            content.classList.toggle('active', isVisible);
            content.setAttribute('aria-hidden', !isVisible ? 'true' : 'false');
        });
    }

    updateURLHash(tabId) {
        if (history.pushState) {
            const newUrl = window.location.pathname + '#' + tabId;
            window.history.pushState({ tab: tabId }, '', newUrl);
        }
    }

    dispatchTabChangeEvent(tabId) {
        const event = new CustomEvent('tabChange', {
            detail: { 
                tabId: tabId,
                tabIndex: this.getTabIndex(tabId),
                tabName: this.getTabName(tabId)
            }
        });
        document.dispatchEvent(event);
    }

    getTabIndex(tabId) {
        return Array.from(this.tabButtons).findIndex(
            btn => btn.getAttribute('data-tab') === tabId
        );
    }

    getTabName(tabId) {
        const button = Array.from(this.tabButtons).find(
            btn => btn.getAttribute('data-tab') === tabId
        );
        return button ? button.textContent : '';
    }

    nextTab() {
        const currentIndex = this.getTabIndex(this.activeTab);
        const nextIndex = (currentIndex + 1) % this.tabButtons.length;
        const nextTabId = this.tabButtons[nextIndex].getAttribute('data-tab');
        this.showTab(nextTabId);
    }

    previousTab() {
        const currentIndex = this.getTabIndex(this.activeTab);
        const prevIndex = (currentIndex - 1 + this.tabButtons.length) % this.tabButtons.length;
        const prevTabId = this.tabButtons[prevIndex].getAttribute('data-tab');
        this.showTab(prevTabId);
    }

    goToTab(index) {
        if (index >= 0 && index < this.tabButtons.length) {
            const tabId = this.tabButtons[index].getAttribute('data-tab');
            this.showTab(tabId);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tabSwitcher = new TabSwitcher();
    
    window.tabSwitcher = tabSwitcher;
    
    document.addEventListener('keydown', (e) => {
        if (e.altKey) {
            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    tabSwitcher.nextTab();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    tabSwitcher.previousTab();
                    break;
            }
        }
    });

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash && tabSwitcher.isValidTab(hash)) {
            tabSwitcher.showTab(hash);
        }
    });

    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (tabSwitcher.isValidTab(hash)) {
            tabSwitcher.showTab(hash);
        }
    }
});