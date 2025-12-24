/**
 * Test script for CharlesWebEditor templates functionality
 * This script tests both old and new templates to ensure they work properly
 */

console.log('🔍 Testing CharlesWebEditor Templates Functionality...\n');

// Test 1: Check if main.js is loaded
console.log('📋 Test 1: Checking if main.js is loaded...');
if (typeof window.charliesEditor !== 'undefined') {
    console.log('✅ main.js loaded successfully');
    console.log(`   Version: ${window.charliesEditor.version}`);
    console.log(`   Release Date: ${window.charliesEditor.releaseDate}`);
} else {
    console.log('❌ main.js not loaded - editor not initialized');
    console.log('   Make sure the editor is running and main.js is loaded');
}

// Test 2: Check templates array
console.log('\n📋 Test 2: Checking templates array...');
if (window.charliesEditor && window.charliesEditor.templates) {
    const templates = window.charliesEditor.templates;
    console.log(`✅ Templates array found with ${templates.length} templates`);

    // List all templates
    templates.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.name} (${template.id}) - ${template.description}`);
    });
} else {
    console.log('❌ Templates array not found');
}

// Test 3: Check templates list in sidebar
console.log('\n📋 Test 3: Checking templates list in sidebar...');
const templatesList = document.getElementById('templatesList');
if (templatesList) {
    console.log('✅ Templates list element found');

    // Check if templates are rendered
    const templateItems = templatesList.querySelectorAll('.template-item');
    if (templateItems.length > 0) {
        console.log(`✅ ${templateItems.length} template items rendered in sidebar`);
    } else {
        console.log('❌ No template items rendered in sidebar');
        console.log('   Checking innerHTML...');
        console.log(`   templatesList.innerHTML length: ${templatesList.innerHTML.length}`);
    }
} else {
    console.log('❌ Templates list element not found');
    console.log('   Looking for element with id="templatesList"');
}

// Test 4: Check template application function
console.log('\n📋 Test 4: Checking template application function...');
if (window.charliesEditor && typeof window.charliesEditor.applyTemplate === 'function') {
    console.log('✅ applyTemplate function exists');

    // Test with a sample template
    if (window.charliesEditor.templates && window.charliesEditor.templates.length > 0) {
        const firstTemplate = window.charliesEditor.templates[0];
        console.log(`   Sample template: ${firstTemplate.name} (${firstTemplate.id})`);
        console.log(`   Function call: window.charliesEditor.applyTemplate('${firstTemplate.id}')`);
    }
} else {
    console.log('❌ applyTemplate function not found');
}

// Test 5: Check templates button
console.log('\n📋 Test 5: Checking templates button...');
const templatesBtn = document.getElementById('templatesBtn');
if (templatesBtn) {
    console.log('✅ Templates button found');
    console.log(`   Button text: ${templatesBtn.textContent || templatesBtn.innerHTML}`);
    console.log(`   Button title: ${templatesBtn.title || 'No title'}`);

    // Check event listener
    const clickEvents = templatesBtn.onclick;
    if (clickEvents) {
        console.log('✅ Templates button has onclick handler');
    } else {
        console.log('⚠️  Templates button has no onclick handler (may use addEventListener)');
    }
} else {
    console.log('❌ Templates button not found');
    console.log('   Looking for element with id="templatesBtn"');
}

// Test 6: Check editor element
console.log('\n📋 Test 6: Checking editor element...');
const editor = document.getElementById('editor');
if (editor) {
    console.log('✅ Editor element found');
    console.log(`   Editor content length: ${editor.innerHTML.length} characters`);
    console.log(`   Editor is contenteditable: ${editor.contentEditable}`);
} else {
    console.log('❌ Editor element not found');
    console.log('   Looking for element with id="editor"');
}

// Test 7: Check for template categories (new feature)
console.log('\n📋 Test 7: Checking for template categories (new feature)...');
if (window.charliesEditor && window.charliesEditor.templates) {
    const templates = window.charliesEditor.templates;
    const categories = new Set();

    templates.forEach(template => {
        if (template.category) {
            categories.add(template.category);
        }
    });

    if (categories.size > 0) {
        console.log(`✅ Template categories found: ${Array.from(categories).join(', ')}`);
    } else {
        console.log('⚠️  No template categories found (old template system)');
    }
}

// Test 8: Check for modular templates system
console.log('\n📋 Test 8: Checking for modular templates system...');
const templatesService = window.TemplatesService;
const templatesUI = window.TemplatesUI;

if (templatesService || templatesUI) {
    console.log('✅ Modular templates system detected');
    if (templatesService) console.log('   TemplatesService found');
    if (templatesUI) console.log('   TemplatesUI found');
} else {
    console.log('⚠️  Modular templates system not detected (using monolithic system)');
}

// Test 9: Check CSS for template styling
console.log('\n📋 Test 9: Checking CSS for template styling...');
const styleSheets = document.styleSheets;
let templateCSSFound = false;

for (let i = 0; i < styleSheets.length; i++) {
    try {
        const rules = styleSheets[i].cssRules || styleSheets[i].rules;
        if (rules) {
            for (let j = 0; j < rules.length; j++) {
                if (rules[j].selectorText && rules[j].selectorText.includes('.template-')) {
                    templateCSSFound = true;
                    break;
                }
            }
        }
    } catch (e) {
        // Cross-origin stylesheets may throw errors
    }
}

if (templateCSSFound) {
    console.log('✅ Template CSS styles found');
} else {
    console.log('⚠️  Template CSS styles not found (check style.css)');
}

// Summary
console.log('\n📊 TEST SUMMARY:');
console.log('================');

const tests = [
    { name: 'main.js loaded', passed: typeof window.charliesEditor !== 'undefined' },
    { name: 'Templates array exists', passed: window.charliesEditor && window.charliesEditor.templates },
    { name: 'Templates list element exists', passed: !!templatesList },
    { name: 'applyTemplate function exists', passed: window.charliesEditor && typeof window.charliesEditor.applyTemplate === 'function' },
    { name: 'Templates button exists', passed: !!templatesBtn },
    { name: 'Editor element exists', passed: !!editor }
];

let passedTests = 0;
tests.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
    if (test.passed) passedTests++;
});

console.log(`\n📈 Results: ${passedTests}/${tests.length} tests passed`);

if (passedTests === tests.length) {
    console.log('\n🎉 All template tests passed! Templates should be working.');
    console.log('\n🔧 To manually test templates:');
    console.log('   1. Click on a template in the sidebar');
    console.log('   2. Check if editor content changes');
    console.log('   3. Check if toast notification appears');
} else {
    console.log('\n⚠️  Some tests failed. Templates may not work properly.');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Check browser console for errors');
    console.log('   2. Ensure main.js is loaded without errors');
    console.log('   3. Check if templates array is properly initialized');
    console.log('   4. Verify CSS is loading correctly');
}

// Helper function to run a template test
console.log('\n🔧 Run this in browser console to test a template:');
console.log(`
function testTemplate(templateId) {
    if (!window.charliesEditor) {
        console.error('Editor not initialized');
        return;
    }

    const template = window.charliesEditor.templates.find(t => t.id === templateId);
    if (!template) {
        console.error('Template not found:', templateId);
        return;
    }

    console.log('Testing template:', template.name);
    window.charliesEditor.applyTemplate(templateId);
}

// Example: testTemplate('blank');
// Example: testTemplate('resume');
`);
