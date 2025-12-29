/**
 * Icon Fix Script - Force reload Font Awesome
 */

console.log('🔧 Starting icon fix...');

// Force Font Awesome reload
function forceFontAwesomeReload() {
    // Remove existing Font Awesome links
    const existingLinks = document.querySelectorAll('link[href*="font-awesome"]');
    existingLinks.forEach(link => link.remove());
    
    // Add fresh Font Awesome with cache busting
    const freshLink = document.createElement('link');
    freshLink.rel = 'stylesheet';
    freshLink.href = `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css?v=${Date.now()}`;
    freshLink.crossorigin = 'anonymous';
    
    // Add to head
    document.head.appendChild(freshLink);
    
    console.log('✅ Font Awesome reloaded with cache busting');
}

// Force icon display
function forceIconDisplay() {
    const style = document.createElement('style');
    style.textContent = `
        .fas, .far, .fab, .fass, .fasr, .fasl {
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
            font-family: 'Font Awesome 6 Free', 'Font Awesome 5 Free' !important;
            font-weight: 900 !important;
            font-style: normal !important;
            font-variant: normal !important;
            text-rendering: auto !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
        }
        
        .toolbar-btn i,
        .header-btn i,
        .toolbar-group i {
            font-family: 'Font Awesome 6 Free', 'Font Awesome 5 Free' !important;
        }
        
        /* Force icon colors */
        .toolbar-btn i::before,
        .header-btn i::before {
            color: inherit !important;
        }
        
        /* Debug outline for icons */
        .toolbar-btn i {
            border: 1px solid rgba(255, 255, 0, 0.1) !important;
            padding: 2px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            border-radius: 3px !important;
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Icon display forced');
}

// Check and fix any broken icons
function fixBrokenIcons() {
    const iconMap = {
        'fa-robot': '🤖',
        'fa-file-alt': '📄',
        'fa-magic': '✨',
        'fa-envelope': '📧',
        'fa-times': '❌',
        'fa-moon': '🌙',
        'fa-sun': '☀️',
        'fa-file-word': '📝',
        'fa-graduation-cap': '🎓',
        'fa-users': '👥',
        'fa-clipboard-list': '📋',
        'fa-cut': '✂️',
        'fa-paper-plane': '📤',
        'fa-check-circle': '✅',
        'fa-exclamation-circle': '⚠️',
        'fa-spell-check': '🔤',
        'fa-columns': '📊',
        'fa-plus': '➕',
        'fa-th': '⚏',
        'fa-sliders-h': '🎛️',
        'fa-font': '🔤',
        'fa-list': '📝',
        'fa-compress-alt': '📦',
        'fa-edit': '✏️',
        'fa-trash': '🗑️',
        'fa-user-tie': '👔',
        'fa-chart-bar': '📊',
        'fa-folder-open': '📂',
        'fa-search': '🔍',
        'fa-exchange-alt': '🔄',
        'fa-save': '💾',
        'fa-undo': '↶',
        'fa-redo': '↷',
        'fa-bold': 'B',
        'fa-italic': 'I',
        'fa-underline': 'U',
        'fa-align-left': '⬅',
        'fa-align-center': '⬌',
        'fa-align-right': '➡',
        'fa-list-ul': '•',
        'fa-list-ol': '1.',
        'fa-image': '🖼️',
        'fa-table': '⊞',
        'fa-link': '🔗',
        'fa-copy': '📋',
        'fa-print': '🖨',
        'fa-play-circle': '▶',
        'fa-map': '🗺️',
        'fa-question-circle': '❓',
        'fa-keyboard': '⌨️',
        'fa-info-circle': 'ℹ️',
        'fa-cog': '⚙️',
        'fa-palette': '🎨',
        'fa-file-pdf': '📕'
    };
    
    // Add data attributes to all icons for debugging
    document.querySelectorAll('i').forEach(icon => {
        const classes = Array.from(icon.classList);
        const iconClass = classes.find(c => c.startsWith('fa-'));
        
        if (iconClass && iconMap[iconClass]) {
            icon.setAttribute('data-icon-name', iconClass);
            icon.setAttribute('data-fallback', iconMap[iconClass]);
            icon.setAttribute('title', `${iconClass} (Fallback: ${iconMap[iconClass]})`);
        }
    });
}

// Apply all fixes
setTimeout(() => {
    forceFontAwesomeReload();
    forceIconDisplay();
    fixBrokenIcons();
    
    console.log('🎯 Icon fixes applied!');
    console.log('🔄 Refresh the page if icons are still not visible.');
}, 500);