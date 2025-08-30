/**
 * Minimal JavaScript for CSS-only Dark/Light Mode Toggle
 * Handles localStorage persistence and system preference detection
 * 
 * Features:
 * - Auto-detects system preference
 * - Persists user choice in localStorage
 * - Minimal DOM manipulation
 * - WCAG 2.1 AA compliant
 * - No dependencies
 */

class ThemeToggle {
  constructor() {
    this.storageKey = 'theme-preference';
    this.attribute = 'data-theme';
    this.themes = {
      LIGHT: 'light',
      DARK: 'dark',
      AUTO: 'auto'
    };
    
    this.init();
  }

  init() {
    // Apply theme before page renders to prevent flash
    this.applyTheme(this.getTheme());
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  /**
   * Get current theme preference
   * Priority: localStorage > system preference > light (fallback)
   */
  getTheme() {
    const stored = localStorage.getItem(this.storageKey);
    
    if (stored && Object.values(this.themes).includes(stored)) {
      return stored;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.themes.DARK;
    }
    
    return this.themes.LIGHT;
  }

  /**
   * Apply theme to document root
   */
  applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === this.themes.AUTO) {
      // Remove explicit theme, let CSS handle system preference
      root.removeAttribute(this.attribute);
    } else {
      root.setAttribute(this.attribute, theme);
    }
    
    // Update toggle switches
    this.updateToggleStates(theme);
    
    // Announce theme change to screen readers
    this.announceThemeChange(theme);
  }

  /**
   * Set theme preference
   */
  setTheme(theme) {
    if (!Object.values(this.themes).includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }
    
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme(theme);
    
    // Dispatch custom event for other components
    this.dispatchThemeChangeEvent(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const current = this.getTheme();
    const next = current === this.themes.LIGHT ? this.themes.DARK : this.themes.LIGHT;
    this.setTheme(next);
  }

  /**
   * Setup event listeners for theme toggles
   */
  setupEventListeners() {
    // Handle toggle switches
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(toggle => {
      if (toggle.type === 'checkbox') {
        toggle.addEventListener('change', (e) => {
          this.toggleTheme();
        });
      } else {
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleTheme();
        });
      }
    });

    // Handle theme selector dropdowns/radio buttons
    const selectors = document.querySelectorAll('[data-theme-selector]');
    selectors.forEach(selector => {
      selector.addEventListener('change', (e) => {
        this.setTheme(e.target.value);
      });
    });

    // Listen for system preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addListener(() => {
        // Only auto-update if no explicit preference is stored
        if (!localStorage.getItem(this.storageKey)) {
          this.applyTheme(this.getTheme());
        }
      });
    }

    // Handle keyboard shortcuts (Ctrl/Cmd + Shift + L)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  /**
   * Update toggle switch states to match current theme
   */
  updateToggleStates(theme) {
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(toggle => {
      if (toggle.type === 'checkbox') {
        toggle.checked = theme === this.themes.DARK;
      }
    });

    const selectors = document.querySelectorAll('[data-theme-selector]');
    selectors.forEach(selector => {
      selector.value = theme;
    });
  }

  /**
   * Announce theme change to screen readers
   */
  announceThemeChange(theme) {
    // Create temporary announcement element
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Theme changed to ${theme} mode`;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Dispatch custom theme change event
   */
  dispatchThemeChangeEvent(theme) {
    const event = new CustomEvent('themechange', {
      detail: { theme, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get system color scheme preference
   */
  getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.themes.DARK;
    }
    return this.themes.LIGHT;
  }

  /**
   * Reset theme to system preference
   */
  resetToSystem() {
    localStorage.removeItem(this.storageKey);
    this.applyTheme(this.getTheme());
  }

  /**
   * Check if current theme matches system preference
   */
  isUsingSystemTheme() {
    const stored = localStorage.getItem(this.storageKey);
    return !stored || stored === this.themes.AUTO;
  }

  /**
   * Get theme statistics for debugging
   */
  getThemeInfo() {
    return {
      current: this.getTheme(),
      system: this.getSystemPreference(),
      stored: localStorage.getItem(this.storageKey),
      isSystemDefault: this.isUsingSystemTheme(),
      supportsSystemPreference: !!(window.matchMedia && window.matchMedia('(prefers-color-scheme)').media)
    };
  }
}

// Initialize theme system immediately
const themeToggle = new ThemeToggle();

// Export for global access
window.ThemeToggle = ThemeToggle;
window.themeToggle = themeToggle;

// Module export for bundlers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeToggle;
}

// ES6 export
if (typeof exports !== 'undefined') {
  exports.ThemeToggle = ThemeToggle;
}

// AMD export
if (typeof define === 'function' && define.amd) {
  define('ThemeToggle', [], () => ThemeToggle);
}

/**
 * Usage Examples:
 * 
 * // Basic toggle
 * themeToggle.toggleTheme();
 * 
 * // Set specific theme
 * themeToggle.setTheme('dark');
 * 
 * // Listen for theme changes
 * document.addEventListener('themechange', (e) => {
 *   console.log('Theme changed to:', e.detail.theme);
 * });
 * 
 * // Get current theme info
 * console.log(themeToggle.getThemeInfo());
 * 
 * // Reset to system preference
 * themeToggle.resetToSystem();
 */