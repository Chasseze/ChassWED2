/**
 * DOMUtils - Utility functions for DOM manipulation
 */
export class DOMUtils {
    /**
     * Safely query selector
     * @param {string} selector - CSS selector
     * @param {Element} context - Search context (default: document)
     * @returns {Element|null} Found element or null
     */
    static query(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch (error) {
            console.error(`Invalid selector: ${selector}`, error);
            return null;
        }
    }

    /**
     * Safely query selector all
     * @param {string} selector - CSS selector
     * @param {Element} context - Search context (default: document)
     * @returns {NodeList} Found elements
     */
    static queryAll(selector, context = document) {
        try {
            return context.querySelectorAll(selector);
        } catch (error) {
            console.error(`Invalid selector: ${selector}`, error);
            return [];
        }
    }

    /**
     * Create element with attributes
     * @param {string} tagName - Element tag name
     * @param {Object} attributes - Element attributes
     * @param {string} innerHTML - Inner HTML content
     * @returns {Element} Created element
     */
    static createElement(tagName, attributes = {}, innerHTML = '') {
        const element = document.createElement(tagName);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });

        if (innerHTML) {
            element.innerHTML = innerHTML;
        }

        return element;
    }

    /**
     * Add event listener with error handling
     * @param {Element} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    static addEventListener(element, event, handler, options = {}) {
        if (!element) return;

        const wrappedHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error(`Error in ${event} handler:`, error);
            }
        };

        element.addEventListener(event, wrappedHandler, options);
    }

    /**
     * Remove event listener
     * @param {Element} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    static removeEventListener(element, event, handler) {
        if (!element) return;
        element.removeEventListener(event, handler);
    }

    /**
     * Sanitize HTML content
     * @param {string} html - HTML content to sanitize
     * @returns {string} Sanitized HTML
     */
    static sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Remove script and style tags
        temp.querySelectorAll('script, style').forEach(el => el.remove());
        
        // Remove event handlers
        temp.querySelectorAll('*').forEach(el => {
            [...el.attributes].forEach(attr => {
                if (/^on/i.test(attr.name)) {
                    el.removeAttribute(attr.name);
                }
            });
        });
        
        return temp.innerHTML;
    }

    /**
     * Check if element is visible in viewport
     * @param {Element} element - Target element
     * @returns {boolean} Visibility status
     */
    static isInViewport(element) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Scroll element into view smoothly
     * @param {Element} element - Target element
     * @param {Object} options - Scroll options
     */
    static scrollIntoView(element, options = {}) {
        if (!element) return;
        
        const defaultOptions = {
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        };
        
        element.scrollIntoView({ ...defaultOptions, ...options });
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Throttle limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Get computed style property
     * @param {Element} element - Target element
     * @param {string} property - CSS property
     * @returns {string} Property value
     */
    static getComputedStyle(element, property) {
        if (!element) return '';
        
        const styles = window.getComputedStyle(element);
        return styles.getPropertyValue(property);
    }

    /**
     * Set CSS custom property (CSS variable)
     * @param {Element} element - Target element
     * @param {string} property - Property name
     * @param {string} value - Property value
     */
    static setCSSVariable(element, property, value) {
        if (!element) return;
        element.style.setProperty(property, value);
    }

    /**
     * Get CSS custom property (CSS variable)
     * @param {Element} element - Target element
     * @param {string} property - Property name
     * @returns {string} Property value
     */
    static getCSSVariable(element, property) {
        if (!element) return '';
        return element.style.getPropertyValue(property);
    }
}