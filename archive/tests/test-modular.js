/**
 * Test script for modular system
 */

// Simple test to verify modules load correctly
console.log('🧪 Testing modular system...');

// Test 1: Check if DOM elements exist
const requiredElements = [
    'editor',
    'page', 
    'pageContainer',
    'aiAssistantBtn',
    'templatesBtn',
    'advancedFormattingBtn',
    'emailShareBtn'
];

console.log('📋 Required elements check:');
requiredElements.forEach(id => {
    const element = document.getElementById(id);
    console.log(`  ${element ? '✅' : '❌'} ${id}: ${element ? 'found' : 'missing'}`);
});

// Test 2: Check if modules are defined
console.log('\n📦 Module definitions check:');
console.log(`  Editor: ${typeof Editor !== 'undefined' ? '✅' : '❌'}`);
console.log(`  AIService: ${typeof AIService !== 'undefined' ? '✅' : '❌'}`);
console.log(`  TemplatesService: ${typeof TemplatesService !== 'undefined' ? '✅' : '❌'}`);
console.log(`  EmailSharingService: ${typeof EmailSharingService !== 'undefined' ? '✅' : '❌'}`);

// Test 3: Check toolbar buttons have event listeners
console.log('\n🎛️  Toolbar buttons check:');
const toolbarButtons = [
    'aiAssistantBtn',
    'templatesBtn', 
    'advancedFormattingBtn',
    'emailShareBtn'
];

toolbarButtons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        console.log(`  ✅ ${id}: Found`);
        
        // Test click handler
        const hasClickListener = btn.getAttribute('data-click-listener');
        console.log(`    🎧 Click listener: ${hasClickListener || 'Not set'}`);
    } else {
        console.log(`  ❌ ${id}: Missing`);
    }
});

// Test 4: Check AI panel existence
console.log('\n🤖 AI components check:');
const aiPanel = document.getElementById('aiAssistant');
if (aiPanel) {
    console.log('  ✅ AI Assistant panel: Found');
} else {
    console.log('  ❌ AI Assistant panel: Missing');
}

// Test 5: Check templates panel
console.log('\n📄 Templates components check:');
const templatesModal = document.getElementById('templatesModal');
if (templatesModal) {
    console.log('  ✅ Templates modal: Found');
} else {
    console.log('  ❌ Templates modal: Missing');
}

// Test 6: Check advanced formatting panel
console.log('\n✨ Advanced formatting check:');
const formattingPanel = document.getElementById('advancedFormattingPanel');
if (formattingPanel) {
    console.log('  ✅ Advanced formatting panel: Found');
} else {
    console.log('  ❌ Advanced formatting panel: Missing');
}

console.log('\n🎯 Test completed! Check browser console for details.');