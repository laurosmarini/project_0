/**
 * React Theme Toggle Component
 * Production-ready React component wrapper for the CSS theme system
 */

import React, { useEffect, useState } from 'react';

const SunIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

/**
 * ThemeToggle Component
 * @param {Object} props
 * @param {'button'|'switch'} props.variant - Toggle style variant
 * @param {'compact'|'default'|'large'} props.size - Toggle size
 * @param {boolean} props.showLabel - Show text label
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onChange - Theme change callback
 * @param {string} props.ariaLabel - Accessibility label
 */
const ThemeToggle = ({
  variant = 'button',
  size = 'default',
  showLabel = false,
  className = '',
  onChange,
  ariaLabel = 'Toggle dark mode'
}) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get initial theme from theme controller
    if (window.themeController) {
      setCurrentTheme(window.themeController.getCurrentTheme());
    }

    // Listen for theme changes
    const handleThemeChange = (e) => {
      setCurrentTheme(e.detail.theme);
      if (onChange) {
        onChange(e.detail.theme);
      }
    };

    document.addEventListener('themechange', handleThemeChange);
    
    return () => {
      document.removeEventListener('themechange', handleThemeChange);
    };
  }, [onChange]);

  const handleToggle = () => {
    if (window.themeController) {
      window.themeController.toggleTheme();
    }
  };

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  const isDark = currentTheme === 'dark';
  
  const sizeClass = {
    compact: 'theme-toggle-compact',
    default: '',
    large: 'theme-toggle-large'
  }[size];

  if (variant === 'switch') {
    return (
      <label className={`theme-toggle ${className}`}>
        <input
          type="checkbox"
          className="theme-toggle-input"
          checked={isDark}
          onChange={handleToggle}
          aria-label={ariaLabel}
        />
        <span className={`theme-toggle-switch ${sizeClass}`}></span>
        {showLabel && (
          <span className="theme-toggle-text">
            {isDark ? 'Dark mode' : 'Light mode'}
          </span>
        )}
      </label>
    );
  }

  return (
    <label className={`theme-toggle ${showLabel ? 'theme-toggle-label' : ''} ${className}`}>
      <input
        type="checkbox"
        className="theme-toggle-input"
        checked={isDark}
        onChange={handleToggle}
        aria-label={ariaLabel}
      />
      <span className={`theme-toggle-btn ${sizeClass}`}>
        <SunIcon className="theme-toggle-icon theme-toggle-icon-sun" />
        <MoonIcon className="theme-toggle-icon theme-toggle-icon-moon" />
      </span>
      {showLabel && (
        <span className="theme-toggle-text">
          {isDark ? 'Dark mode' : 'Light mode'}
        </span>
      )}
    </label>
  );
};

/**
 * Hook for using theme state in React components
 */
export const useTheme = () => {
  const [theme, setTheme] = useState('light');
  const [systemPreference, setSystemPreference] = useState('light');

  useEffect(() => {
    if (window.themeController) {
      setTheme(window.themeController.getCurrentTheme());
      setSystemPreference(window.themeController.getSystemPreference());
    }

    const handleThemeChange = (e) => {
      setTheme(e.detail.theme);
    };

    const handleSystemChange = () => {
      if (window.themeController) {
        setSystemPreference(window.themeController.getSystemPreference());
      }
    };

    document.addEventListener('themechange', handleThemeChange);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemChange);

    return () => {
      document.removeEventListener('themechange', handleThemeChange);
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemChange);
    };
  }, []);

  const toggleTheme = () => {
    if (window.themeController) {
      window.themeController.toggleTheme();
    }
  };

  const setThemePreference = (newTheme) => {
    if (window.themeController) {
      window.themeController.setTheme(newTheme);
    }
  };

  const resetToSystemPreference = () => {
    if (window.themeController) {
      window.themeController.resetToSystemPreference();
    }
  };

  return {
    theme,
    systemPreference,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme: setThemePreference,
    resetToSystemPreference
  };
};

export default ThemeToggle;

/**
 * Usage Examples:
 * 
 * // Basic toggle
 * <ThemeToggle />
 * 
 * // Switch variant with label
 * <ThemeToggle variant="switch" showLabel />
 * 
 * // Large toggle with callback
 * <ThemeToggle 
 *   size="large" 
 *   onChange={(theme) => console.log('Theme changed:', theme)}
 * />
 * 
 * // Using the hook
 * const { theme, isDark, toggleTheme } = useTheme();
 * 
 * return (
 *   <div>
 *     <p>Current theme: {theme}</p>
 *     <button onClick={toggleTheme}>Toggle</button>
 *   </div>
 * );
 */