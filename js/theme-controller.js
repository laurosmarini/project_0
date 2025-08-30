/**
 * Theme Controller - Minimal JavaScript for localStorage persistence
 * Handles theme detection, storage, and system preference changes
 * WCAG 2.1 AA compliant with proper accessibility support
 */

class ThemeController {
  constructor() {
    this.storageKey = 'app-theme';
    this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
    this.currentTheme = null;
    
    this.init();
  }

  init() {
    // Set initial theme
    this.setTheme(this.getPreferredTheme(), false);
    
    // Listen for system preference changes
    this.systemPreference.addEventListener('change', () => {
      const storedTheme = this.getStoredTheme();
      if (!storedTheme) {
        this.setTheme(this.getPreferredTheme(), false);
      }
    });
    
    // Listen for toggle events
    this.setupToggleListeners();
    
    // Handle page visibility changes (for cross-tab sync)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncTheme();
      }
    });
    
    // Listen for storage events (cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.syncTheme();
      }
    });
  }

  /**
   * Get the preferred theme based on storage or system preference
   */
  getPreferredTheme() {
    const storedTheme = this.getStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }
    
    return this.systemPreference.matches ? 'dark' : 'light';
  }

  /**
   * Get theme from localStorage
   */
  getStoredTheme() {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
      return null;
    }
  }

  /**
   * Store theme in localStorage
   */
  storeTheme(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      console.warn('Failed to store theme in localStorage:', error);
    }
  }

  /**
   * Set the theme on the document
   */
  setTheme(theme, shouldStore = true) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn('Invalid theme:', theme);
      return;
    }

    // Remove existing theme attributes
    document.documentElement.removeAttribute('data-theme');
    
    // Set new theme
    if (theme !== 'light') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Update color-scheme for better browser integration
    document.documentElement.style.colorScheme = theme;
    
    this.currentTheme = theme;
    
    if (shouldStore) {
      this.storeTheme(theme);
    }
    
    // Update toggle states
    this.updateToggleStates();
    
    // Dispatch custom event
    this.dispatchThemeChangeEvent(theme);
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor();
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Sync theme across tabs
   */
  syncTheme() {
    const preferredTheme = this.getPreferredTheme();
    if (preferredTheme !== this.currentTheme) {
      this.setTheme(preferredTheme, false);
    }
  }

  /**
   * Setup event listeners for theme toggles
   */
  setupToggleListeners() {
    // Find all theme toggle inputs
    const toggles = document.querySelectorAll('.theme-toggle-input');
    
    toggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        e.preventDefault();
        this.toggleTheme();
      });
    });
    
    // Also listen for clicks on toggle buttons/labels
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Don't double-handle if it's already handled by input
        if (!e.target.closest('.theme-toggle-input')) {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    });
  }

  /**
   * Update all toggle input states to match current theme
   */
  updateToggleStates() {
    const toggles = document.querySelectorAll('.theme-toggle-input');
    const isDark = this.currentTheme === 'dark';
    
    toggles.forEach(toggle => {
      toggle.checked = isDark;
      
      // Update aria-checked for accessibility
      toggle.setAttribute('aria-checked', isDark.toString());
      
      // Update labels if they exist
      const label = toggle.closest('label') || document.querySelector(`label[for="${toggle.id}"]`);
      if (label) {
        const themeText = label.querySelector('.theme-toggle-text');
        if (themeText) {
          themeText.textContent = isDark ? 'Dark mode' : 'Light mode';
        }
      }
    });
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
   * Update meta theme-color for mobile browsers
   */
  updateMetaThemeColor() {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // Get computed background color
    const backgroundColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-background').trim();
    
    metaThemeColor.content = backgroundColor || (this.currentTheme === 'dark' ? '#1a1a1a' : '#ffffff');
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Check if system prefers dark mode
   */
  getSystemPreference() {
    return this.systemPreference.matches ? 'dark' : 'light';
  }

  /**
   * Reset to system preference
   */
  resetToSystemPreference() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear theme from localStorage:', error);
    }
    
    this.setTheme(this.getSystemPreference(), false);
  }
}

// Initialize theme controller when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeController = new ThemeController();
  });
} else {
  window.themeController = new ThemeController();
}

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeController;
}

// Expose global API
window.ThemeController = ThemeController;

/**
 * Usage Examples:
 * 
 * // Toggle theme
 * window.themeController.toggleTheme();
 * 
 * // Set specific theme
 * window.themeController.setTheme('dark');
 * 
 * // Get current theme
 * console.log(window.themeController.getCurrentTheme());
 * 
 * // Listen for theme changes
 * document.addEventListener('themechange', (e) => {
 *   console.log('Theme changed to:', e.detail.theme);
 * });
 * 
 * // Reset to system preference
 * window.themeController.resetToSystemPreference();
 */