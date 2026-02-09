/**
 * Theme Module (Light/Dark Mode)
 * Author: Carlos Garzón López (cgvrzon)
 *
 * Handles theme switching with localStorage persistence,
 * OS preference detection, and smooth transitions.
 */

const Theme = (function() {
    'use strict';

    // ==========================================
    // Configuration
    // ==========================================
    const CONFIG = {
        storageKey: 'portfolio_theme',
        toggleId: 'theme-toggle',
        transitionClass: 'theme-transitioning',
        transitionDuration: 400,
        themeColors: {
            dark: '#0a0a0b',
            light: '#fafafa'
        }
    };

    // ==========================================
    // Private Methods
    // ==========================================

    /**
     * Detects the preferred theme
     * Priority: localStorage > OS preference > dark (default)
     * @returns {string} 'dark' or 'light'
     */
    function detectTheme() {
        // 1. Check localStorage
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (stored === 'dark' || stored === 'light') {
            return stored;
        }

        // 2. Check OS preference
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }

        // 3. Default to dark
        return 'dark';
    }

    /**
     * Applies the theme to the document
     * @param {string} theme - 'dark' or 'light'
     * @param {boolean} animate - Whether to animate the transition
     */
    function applyTheme(theme, animate) {
        const html = document.documentElement;

        if (animate) {
            html.classList.add(CONFIG.transitionClass);
        }

        if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
        } else {
            html.removeAttribute('data-theme');
        }

        // Update meta theme-color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', CONFIG.themeColors[theme]);
        }

        if (animate) {
            setTimeout(function() {
                html.classList.remove(CONFIG.transitionClass);
            }, CONFIG.transitionDuration);
        }
    }

    /**
     * Toggles between dark and light themes
     */
    function toggle() {
        var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        var next = current === 'dark' ? 'light' : 'dark';

        applyTheme(next, true);

        try {
            localStorage.setItem(CONFIG.storageKey, next);
        } catch (e) {
            // localStorage not available
        }
    }

    /**
     * Initializes the theme system
     */
    function init() {
        var theme = detectTheme();
        applyTheme(theme, false);

        // Bind toggle button
        var btn = document.getElementById(CONFIG.toggleId);
        if (btn) {
            btn.addEventListener('click', toggle);
        }

        // Listen to OS preference changes
        var mq = window.matchMedia('(prefers-color-scheme: light)');
        mq.addEventListener('change', function(e) {
            // Only react if user hasn't set a manual preference
            if (!localStorage.getItem(CONFIG.storageKey)) {
                applyTheme(e.matches ? 'light' : 'dark', true);
            }
        });
    }

    // ==========================================
    // Expose Public API
    // ==========================================
    return {
        init: init,
        toggle: toggle
    };

})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { Theme.init(); });
} else {
    Theme.init();
}
