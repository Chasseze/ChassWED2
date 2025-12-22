/**
 * Main application entry point
 */

// Import the new modular editor
import { Editor } from './src/core/Editor.js';

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if the old global editor exists and remove it
    if (window.charlesEditor) {
        console.warn('⚠️ Old editor detected, cleaning up...');
        window.charlesEditor = null;
    }
    
    // Initialize new modular editor
    try {
        window.editor = new Editor({
            autoSave: true,
            autoSaveInterval: 10000,
            spellCheck: false,
            theme: localStorage.getItem('editor_theme') || 'light',
            maxUndoSteps: 50
        });
        
        console.log('✅ New modular editor initialized successfully!');
        
        // Global access for debugging
        window.debugEditor = window.editor;
        
    } catch (error) {
        console.error('❌ Failed to initialize modular editor:', error);
        
        // Fallback to simple editor if modular fails
        console.log('🔄 Attempting fallback initialization...');
        initializeFallbackEditor();
    }
});

/**
 * Fallback editor initialization
 */
function initializeFallbackEditor() {
    // Simple editor functionality as fallback
    const editorElement = document.getElementById('editor');
    if (editorElement) {
        editorElement.contentEditable = true;
        editorElement.innerHTML = '<p>Start typing here...</p>';
        console.log('✅ Fallback editor initialized');
    }
}

/**
 * Error boundary for global errors
 */
window.addEventListener('error', (event) => {
    console.error('🚨 Global error caught:', event.error);
    
    // Show user-friendly error message
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>An error occurred. Please refresh the page.</span>
    `;
    
    document.body.appendChild(toast);
    toast.classList.add('visible');
    
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
});