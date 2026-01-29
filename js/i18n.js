/**
 * Internationalization (i18n) Module
 * Author: Carlos Garzón López (cgvrzon)
 * 
 * Handles language switching and text translation for the portfolio.
 * Supports ES, EN, and CA languages with localStorage persistence.
 */

const I18n = (function() {
    'use strict';

    // ==========================================
    // Configuration
    // ==========================================
    const CONFIG = {
        defaultLang: 'es',
        supportedLangs: ['es', 'en', 'ca'],
        storageKey: 'portfolio_lang',
        localesPath: './locales'
    };

    // ==========================================
    // State
    // ==========================================
    let currentLang = CONFIG.defaultLang;
    let translations = {};
    let isInitialized = false;

    // ==========================================
    // Private Methods
    // ==========================================

    /**
     * Detects user's preferred language from browser or localStorage
     * @returns {string} Language code
     */
    function detectLanguage() {
        // 1. Check localStorage first (user preference)
        const storedLang = localStorage.getItem(CONFIG.storageKey);
        if (storedLang && CONFIG.supportedLangs.includes(storedLang)) {
            return storedLang;
        }

        // 2. Check browser language
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang && CONFIG.supportedLangs.includes(browserLang)) {
            return browserLang;
        }

        // 3. Fallback to default
        return CONFIG.defaultLang;
    }

    /**
     * Fetches translation file for a given language
     * @param {string} lang - Language code
     * @returns {Promise<Object>} Translation object
     */
    async function fetchTranslations(lang) {
        try {
            const response = await fetch(`${CONFIG.localesPath}/${lang}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to load translations for: ${lang}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`[i18n] Error loading translations:`, error);
            
            // If not default language, try fallback
            if (lang !== CONFIG.defaultLang) {
                console.warn(`[i18n] Falling back to ${CONFIG.defaultLang}`);
                return fetchTranslations(CONFIG.defaultLang);
            }
            
            return {};
        }
    }

    /**
     * Gets a nested value from an object using dot notation
     * @param {Object} obj - Object to search
     * @param {string} path - Dot-notation path (e.g., 'hero.tagline')
     * @returns {string|undefined} Value at path
     */
    function getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Applies translations to all elements with data-i18n attribute
     */
    function applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getNestedValue(translations, key);
            
            if (translation) {
                // Check if element has specific attribute to translate
                const targetAttr = element.getAttribute('data-i18n-attr');
                
                if (targetAttr) {
                    element.setAttribute(targetAttr, translation);
                } else {
                    element.textContent = translation;
                }
            } else {
                console.warn(`[i18n] Missing translation for key: ${key}`);
            }
        });
    }

    /**
     * Updates document metadata (lang, title, description)
     */
    function updateDocumentMeta() {
        const meta = translations.meta;
        
        if (!meta) return;

        // Update html lang attribute
        document.documentElement.lang = meta.lang || currentLang;

        // Update page title
        if (meta.title) {
            document.title = meta.title;
        }

        // Update meta description
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta && meta.description) {
            descriptionMeta.setAttribute('content', meta.description);
        }

        // Update OG tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        
        if (ogTitle && meta.title) {
            ogTitle.setAttribute('content', meta.title);
        }
        if (ogDescription && meta.description) {
            ogDescription.setAttribute('content', meta.description);
        }
    }

    /**
     * Updates language selector UI to reflect current language
     */
    function updateLangSelector() {
        const buttons = document.querySelectorAll('.lang-btn');
        
        buttons.forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            const isActive = lang === currentLang;
            
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive.toString());
        });
    }

    /**
     * Saves language preference to localStorage
     * @param {string} lang - Language code to save
     */
    function saveLanguagePreference(lang) {
        try {
            localStorage.setItem(CONFIG.storageKey, lang);
        } catch (error) {
            console.warn('[i18n] Could not save language preference:', error);
        }
    }

    /**
     * Dispatches custom event when language changes
     * @param {string} lang - New language code
     */
    function dispatchLanguageChange(lang) {
        const event = new CustomEvent('languageChanged', {
            detail: { language: lang, translations }
        });
        document.dispatchEvent(event);
    }

    // ==========================================
    // Public API
    // ==========================================

    /**
     * Initializes the i18n system
     * @returns {Promise<void>}
     */
    async function init() {
        if (isInitialized) {
            console.warn('[i18n] Already initialized');
            return;
        }

        currentLang = detectLanguage();
        translations = await fetchTranslations(currentLang);
        
        applyTranslations();
        updateDocumentMeta();
        updateLangSelector();
        bindEvents();
        
        isInitialized = true;
        console.log(`[i18n] Initialized with language: ${currentLang}`);
    }

    /**
     * Changes the current language
     * @param {string} lang - Language code to switch to
     * @returns {Promise<boolean>} Success status
     */
    async function setLanguage(lang) {
        if (!CONFIG.supportedLangs.includes(lang)) {
            console.error(`[i18n] Unsupported language: ${lang}`);
            return false;
        }

        if (lang === currentLang) {
            return true;
        }

        translations = await fetchTranslations(lang);
        currentLang = lang;
        
        applyTranslations();
        updateDocumentMeta();
        updateLangSelector();
        saveLanguagePreference(lang);
        dispatchLanguageChange(lang);

        console.log(`[i18n] Language changed to: ${lang}`);
        return true;
    }

    /**
     * Gets translation for a specific key
     * @param {string} key - Dot-notation key (e.g., 'hero.tagline')
     * @param {string} [fallback] - Fallback text if key not found
     * @returns {string} Translated text or fallback
     */
    function t(key, fallback = '') {
        const value = getNestedValue(translations, key);
        return value !== undefined ? value : fallback;
    }

    /**
     * Gets the current language code
     * @returns {string} Current language code
     */
    function getCurrentLanguage() {
        return currentLang;
    }

    /**
     * Gets all supported languages
     * @returns {string[]} Array of supported language codes
     */
    function getSupportedLanguages() {
        return [...CONFIG.supportedLangs];
    }

    /**
     * Binds event listeners for language switching
     */
    function bindEvents() {
        document.addEventListener('click', (event) => {
            const langBtn = event.target.closest('.lang-btn');
            
            if (langBtn) {
                const lang = langBtn.getAttribute('data-lang');
                setLanguage(lang);
            }
        });
    }

    // ==========================================
    // Expose Public API
    // ==========================================
    return {
        init,
        setLanguage,
        t,
        getCurrentLanguage,
        getSupportedLanguages
    };

})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
    I18n.init();
}

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}
