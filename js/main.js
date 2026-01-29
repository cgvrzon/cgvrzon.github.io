/**
 * Main Application Entry Point
 * Author: Carlos Garzón López (cgvrzon)
 * 
 * Initializes all portfolio functionality and manages global state.
 */

const Portfolio = (function() {
    'use strict';

    // ==========================================
    // Configuration
    // ==========================================
    const CONFIG = {
        debug: false,
        animationThreshold: 0.1
    };

    // ==========================================
    // State
    // ==========================================
    let isInitialized = false;

    // ==========================================
    // Logging Utility
    // ==========================================
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[Portfolio]', ...args);
        }
    }

    // ==========================================
    // Feature: Smooth Scroll for Anchor Links
    // ==========================================
    function initSmoothScroll() {
        document.addEventListener('click', (event) => {
            const anchor = event.target.closest('a[href^="#"]');
            
            if (!anchor) return;
            
            const targetId = anchor.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                event.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without triggering scroll
                history.pushState(null, '', `#${targetId}`);
            }
        });
        
        log('Smooth scroll initialized');
    }

    // ==========================================
    // Feature: Intersection Observer for Animations
    // ==========================================
    function initScrollAnimations() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            log('Reduced motion preferred, skipping scroll animations');
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        // Optionally unobserve after animation
                        // observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: CONFIG.animationThreshold,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe all elements with animation class
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        log('Scroll animations initialized');
    }

    // ==========================================
    // Feature: External Links Handler
    // ==========================================
    function initExternalLinks() {
        // Add rel="noopener noreferrer" to external links that don't have it
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            const rel = link.getAttribute('rel') || '';
            
            if (!rel.includes('noopener')) {
                link.setAttribute('rel', `${rel} noopener noreferrer`.trim());
            }
        });

        log('External links secured');
    }

    // ==========================================
    // Feature: Keyboard Navigation Enhancements
    // ==========================================
    function initKeyboardNav() {
        // Skip to main content on Tab (if skip link exists)
        const skipLink = document.querySelector('.skip-link');
        
        if (skipLink) {
            skipLink.addEventListener('click', (event) => {
                event.preventDefault();
                const mainContent = document.getElementById('main-content');
                
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        log('Keyboard navigation initialized');
    }

    // ==========================================
    // Feature: Current Year in Footer
    // ==========================================
    function initDynamicYear() {
        const yearElements = document.querySelectorAll('[data-current-year]');
        const currentYear = new Date().getFullYear();
        
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });

        log('Dynamic year updated');
    }

    // ==========================================
    // Feature: Language Change Listener
    // ==========================================
    function initLanguageListener() {
        document.addEventListener('languageChanged', (event) => {
            const { language } = event.detail;
            log(`Language changed to: ${language}`);
            
            // Add any additional actions needed on language change
            // For example, updating dynamic content or re-initializing components
        });

        log('Language listener initialized');
    }

    // ==========================================
    // Feature: Console Easter Egg
    // ==========================================
    function initConsoleEasterEgg() {
        const styles = [
            'color: #3b82f6',
            'font-size: 14px',
            'font-weight: bold',
            'padding: 10px'
        ].join(';');

        console.log('%c¡Hola! 👋', styles);
        console.log('%cSi estás leyendo esto, probablemente te interesa el código.', 'color: #a1a1aa');
        console.log('%cEcha un vistazo al repositorio: https://github.com/cgvrzon/cgvrzon.github.io', 'color: #22d3ee');
        console.log('%c¿Tienes alguna pregunta? Escríbeme a contacto@cgvrzon.dev', 'color: #a1a1aa');
    }

    // ==========================================
    // Public API
    // ==========================================

    /**
     * Initializes all portfolio features
     */
    function init() {
        if (isInitialized) {
            console.warn('[Portfolio] Already initialized');
            return;
        }

        initSmoothScroll();
        initScrollAnimations();
        initExternalLinks();
        initKeyboardNav();
        initDynamicYear();
        initLanguageListener();
        initConsoleEasterEgg();

        isInitialized = true;
        log('Portfolio fully initialized');
    }

    /**
     * Enables debug mode
     */
    function enableDebug() {
        CONFIG.debug = true;
        console.log('[Portfolio] Debug mode enabled');
    }

    return {
        init,
        enableDebug
    };

})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Portfolio.init());
} else {
    Portfolio.init();
}
