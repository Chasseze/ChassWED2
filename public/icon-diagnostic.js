/**
 * Icon Diagnostic Script
 */

console.log('🔍 Starting icon diagnostics...');

// 1. Check Font Awesome CSS loading
function checkFontAwesomeLoading() {
    const fontAwesomeLink = document.querySelector('link[href*="font-awesome"]');
    if (fontAwesomeLink) {
        console.log('✅ Font Awesome CSS link found:', fontAwesomeLink.href);
        
        // Test if the CSS actually loaded
        const testElement = document.createElement('i');
        testElement.className = 'fas fa-test';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        document.body.appendChild(testElement);
        
        setTimeout(() => {
            const styles = window.getComputedStyle(testElement);
            const hasFontAwesome = styles.fontFamily.includes('Font Awesome');
            console.log(`${hasFontAwesome ? '✅' : '❌'} Font Awesome loaded: ${hasFontAwesome}`);
            testElement.remove();
        }, 100);
    } else {
        console.log('❌ Font Awesome CSS link NOT found');
    }
}

// 2. Check individual icons
function checkSpecificIcons() {
    const iconClasses = [
        'fas fa-robot',
        'fas fa-file-alt',
        'fas fa-magic',
        'fas fa-envelope',
        'fas fa-times',
        'fas fa-moon',
        'fas fa-sun'
    ];
    
    console.log('\n🎯 Checking specific icons:');
    iconClasses.forEach(className => {
        const testElement = document.createElement('i');
        testElement.className = className;
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        document.body.appendChild(testElement);
        
        setTimeout(() => {
            const styles = window.getComputedStyle(testElement);
            const isVisible = styles.opacity !== '0' && styles.visibility !== 'hidden';
            const hasFont = styles.fontFamily.includes('Font Awesome') || styles.fontFamily === '"Font Awesome 6 Free"';
            
            console.log(`${isVisible && hasFont ? '✅' : '❌'} ${className}: Visible=${isVisible}, Font=${hasFont}`);
            testElement.remove();
        }, 50);
    });
}

// 3. Check toolbar buttons for icons
function checkToolbarIcons() {
    console.log('\n🔧 Checking toolbar icons:');
    const buttons = document.querySelectorAll('.toolbar-btn');
    
    buttons.forEach((button, index) => {
        const icon = button.querySelector('i');
        if (icon) {
            console.log(`✅ Button ${index + 1}: ${icon.className}`);
            
            // Check if icon is visible
            const styles = window.getComputedStyle(icon);
            const isVisible = styles.opacity !== '0' && styles.display !== 'none';
            console.log(`   Visibility: ${isVisible}`);
        } else {
            console.log(`❌ Button ${index + 1}: No icon found`);
        }
    });
}

// 4. Test network connectivity to CDN
function testCDNConnectivity() {
    console.log('\n🌐 Testing CDN connectivity...');
    
    const fontAwesomeUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    
    fetch(fontAwesomeUrl, { method: 'HEAD' })
        .then(response => {
            console.log(`✅ Font Awesome CDN accessible: ${response.status}`);
        })
        .catch(error => {
            console.log(`❌ Font Awesome CDN error: ${error.message}`);
        });
}

// 5. Check for CSS conflicts
function checkCSSConflicts() {
    console.log('\n🎨 Checking for CSS conflicts...');
    
    const styles = Array.from(document.styleSheets);
    let fontAwesomeFound = false;
    
    styles.forEach((sheet, index) => {
        if (sheet.href && sheet.href.includes('font-awesome')) {
            fontAwesomeFound = true;
            console.log(`✅ Font Awesome stylesheet found at index ${index}:`, sheet.href);
            
            // Check if it's loaded
            try {
                const rules = sheet.cssRules || sheet.rules;
                console.log(`   Rules count: ${rules ? rules.length : 'Cannot access (CORS?)'}`);
            } catch (e) {
                console.log(`   ❌ Cannot access CSS rules (likely CORS): ${e.message}`);
            }
        }
    });
    
    if (!fontAwesomeFound) {
        console.log('❌ No Font Awesome stylesheet found in document.styleSheets');
    }
}

// 6. Alternative icon fallback test
function testAlternativeIcons() {
    console.log('\n🔄 Testing alternative icon approach...');
    
    const testDiv = document.createElement('div');
    testDiv.innerHTML = `
        <i class="fas fa-robot" style="position: absolute; left: -9999px;">TEST</i>
        <span style="font-family: 'Font Awesome 6 Free'; position: absolute; left: -9999px;"></span>
    `;
    document.body.appendChild(testDiv);
    
    setTimeout(() => {
        const icon = testDiv.querySelector('i');
        const unicode = testDiv.querySelector('span');
        
        const iconStyles = window.getComputedStyle(icon);
        const unicodeStyles = window.getComputedStyle(unicode);
        
        console.log('Icon test results:');
        console.log(`  Icon element: opacity=${iconStyles.opacity}, visibility=${iconStyles.visibility}`);
        console.log(`  Unicode fallback: opacity=${unicodeStyles.opacity}, font-family=${unicodeStyles.fontFamily}`);
        
        testDiv.remove();
    }, 100);
}

// Run all diagnostics
setTimeout(() => {
    checkFontAwesomeLoading();
    checkSpecificIcons();
    checkToolbarIcons();
    testCDNConnectivity();
    checkCSSConflicts();
    testAlternativeIcons();
    
    console.log('\n🏁 Icon diagnostics complete!');
    
    // Provide solution suggestions
    console.log('\n💡 If icons are not working, try these solutions:');
    console.log('1. Check internet connection');
    console.log('2. Try disabling ad blockers');
    console.log('3. Clear browser cache');
    console.log('4. Try a different browser');
    console.log('5. Use local Font Awesome files');
}, 1000);