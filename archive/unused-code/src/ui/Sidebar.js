/**
 * Sidebar - Manages sidebar functionality and tabs
 */
import { EventEmitter } from '../utils/EventEmitter.js';
import { DOMUtils } from '../utils/DOMUtils.js';

export class Sidebar extends EventEmitter {
    constructor() {
        super();
        this.sidebarElement = null;
        this.tabs = new Map();
        this.activeTab = null;
        this.isCollapsed = false;
        
        this.initialize();
    }

    /**
     * Initialize sidebar
     */
    initialize() {
        this.sidebarElement = DOMUtils.query('#sidebar');
        if (!this.sidebarElement) {
            console.warn('Sidebar element not found');
            return;
        }
        
        this.setupTabs();
        this.setupEventListeners();
    }

    /**
     * Setup sidebar tabs
     */
    setupTabs() {
        const tabElements = DOMUtils.queryAll('.sidebar-tab');
        const contentElements = DOMUtils.queryAll('.sidebar-tab-content');
        
        tabElements.forEach(tab => {
            const tabName = tab.dataset.tab;
            if (tabName) {
                this.tabs.set(tabName, {
                    element: tab,
                    content: contentElements.find(content => 
                        content.dataset.tab === tabName
                    )
                });
                
                DOMUtils.addEventListener(tab, 'click', () => {
                    this.switchTab(tabName);
                });
            }
        });
        
        // Set initial active tab
        const initialTab = tabElements.find(tab => 
            tab.classList.contains('active')
        );
        if (initialTab) {
            this.activeTab = initialTab.dataset.tab;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle sidebar button
        const toggleBtn = DOMUtils.query('#toggleSidebarBtn');
        if (toggleBtn) {
            DOMUtils.addEventListener(toggleBtn, 'click', () => {
                this.toggle();
            });
        }
        
        // Handle window resize
        DOMUtils.addEventListener(window, 'resize', 
            DOMUtils.throttle(() => this.handleResize(), 250)
        );
    }

    /**
     * Switch to a tab
     * @param {string} tabName - Tab name
     */
    switchTab(tabName) {
        const tab = this.tabs.get(tabName);
        if (!tab || tabName === this.activeTab) {
            return;
        }
        
        // Deactivate current tab
        if (this.activeTab) {
            const currentTab = this.tabs.get(this.activeTab);
            if (currentTab) {
                currentTab.element.classList.remove('active');
                if (currentTab.content) {
                    currentTab.content.classList.remove('active');
                }
            }
        }
        
        // Activate new tab
        tab.element.classList.add('active');
        if (tab.content) {
            tab.content.classList.add('active');
        }
        
        this.activeTab = tabName;
        
        this.emit('tabChanged', { tabName, tab });
    }

    /**
     * Get current active tab
     * @returns {string|null} Active tab name
     */
    getActiveTab() {
        return this.activeTab;
    }

    /**
     * Toggle sidebar collapse state
     */
    toggle() {
        this.isCollapsed = !this.isCollapsed;
        
        if (this.isCollapsed) {
            this.sidebarElement.classList.add('collapsed');
        } else {
            this.sidebarElement.classList.remove('collapsed');
        }
        
        this.emit('toggle', { collapsed: this.isCollapsed });
    }

    /**
     * Collapse sidebar
     */
    collapse() {
        if (!this.isCollapsed) {
            this.toggle();
        }
    }

    /**
     * Expand sidebar
     */
    expand() {
        if (this.isCollapsed) {
            this.toggle();
        }
    }

    /**
     * Check if sidebar is collapsed
     * @returns {boolean} Collapsed state
     */
    isCollapsedState() {
        return this.isCollapsed;
    }

    /**
     * Update tab content
     * @param {string} tabName - Tab name
     * @param {string} content - New content
     */
    updateTabContent(tabName, content) {
        const tab = this.tabs.get(tabName);
        if (tab && tab.content) {
            tab.content.innerHTML = content;
            this.emit('tabContentUpdated', { tabName, content });
        }
    }

    /**
     * Add content to tab
     * @param {string} tabName - Tab name
     * @param {string} content - Content to add
     * @param {boolean} append - Whether to append or replace
     */
    addTabContent(tabName, content, append = false) {
        const tab = this.tabs.get(tabName);
        if (tab && tab.content) {
            if (append) {
                tab.content.innerHTML += content;
            } else {
                tab.content.innerHTML = content;
            }
            this.emit('tabContentAdded', { tabName, content, append });
        }
    }

    /**
     * Clear tab content
     * @param {string} tabName - Tab name
     */
    clearTabContent(tabName) {
        this.updateTabContent(tabName, '');
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const width = window.innerWidth;
        
        // Auto-collapse on small screens
        if (width < 768 && !this.isCollapsed) {
            this.collapse();
        } else if (width >= 768 && this.isCollapsed) {
            this.expand();
        }
        
        this.emit('resize', { width });
    }

    /**
     * Get sidebar element
     * @returns {Element|null} Sidebar element
     */
    getElement() {
        return this.sidebarElement;
    }

    /**
     * Get all tabs
     * @returns {Map} Tabs map
     */
    getTabs() {
        return new Map(this.tabs);
    }

    /**
     * Get tab by name
     * @param {string} tabName - Tab name
     * @returns {Object|null} Tab object
     */
    getTab(tabName) {
        return this.tabs.get(tabName) || null;
    }

    /**
     * Show loading state for tab
     * @param {string} tabName - Tab name
     */
    showTabLoading(tabName) {
        const tab = this.tabs.get(tabName);
        if (tab && tab.content) {
            tab.content.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading" style="display: inline-block; width: 20px; height: 20px; border: 2px solid #ccc; border-top: 2px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p style="margin-top: 10px; color: #666;">Loading...</p>
                </div>
            `;
        }
    }

    /**
     * Show error state for tab
     * @param {string} tabName - Tab name
     * @param {string} message - Error message
     */
    showTabError(tabName, message) {
        const tab = this.tabs.get(tabName);
        if (tab && tab.content) {
            tab.content.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="color: #dc3545; font-size: 24px; margin-bottom: 10px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <p style="color: #dc3545;">${message}</p>
                </div>
            `;
        }
    }

    /**
     * Refresh tab content
     * @param {string} tabName - Tab name
     * @param {Function} contentFunction - Function to generate content
     */
    async refreshTab(tabName, contentFunction) {
        this.showTabLoading(tabName);
        
        try {
            const content = await contentFunction();
            this.updateTabContent(tabName, content);
            this.emit('tabRefreshed', { tabName, content });
        } catch (error) {
            this.showTabError(tabName, 'Failed to load content');
            this.emit('tabRefreshError', { tabName, error });
        }
    }

    /**
     * Destroy sidebar
     */
    destroy() {
        this.removeAllListeners();
        this.tabs.clear();
        this.activeTab = null;
        this.isCollapsed = false;
    }
}