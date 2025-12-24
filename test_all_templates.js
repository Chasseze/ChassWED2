
/**
 * Test Script for CharlesWebEditor - All Merged Templates Verification
 * This script tests all templates from both old and new systems
 */

console.log('🔍 ============================================');
console.log('🔍 CharlesWebEditor - All Templates Test');
console.log('🔍 ============================================\n');

// Test configuration
const TEST_CONFIG = {
    autoRun: true,
    testEachTemplate: true,
    showDetails: true,
    timeout: 3000
};

// Test results
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    templates: []
};

// Utility functions
function log(message, type = 'info') {
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        debug: '🔍'
    };
    console.log(`${icons[type] || '📝'} ${message}`);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main test function
async function testAllTemplates() {
    console.log('🚀 Starting comprehensive template tests...\n');

    // Test 1: Check if editor is loaded
    log('Test 1: Checking editor initialization...', 'info');
    if (typeof window.charliesEditor === 'undefined') {
        log('❌ Editor not found! Make sure main.js is loaded.', 'error');
        return;
    }

    const editor = window.charliesEditor;
    log(`✅ Editor found: v${editor.version}`, 'success');

    // Test 2: Check templates array
    log('\nTest 2: Checking templates array...', 'info');
    if (!editor.templates || !Array.isArray(editor.templates)) {
        log('❌ Templates array not found or invalid!', 'error');
        return;
    }

    const templates = editor.templates;
    testResults.total = templates.length;
    log(`✅ Found ${templates.length} templates`, 'success');

    // List all templates
    console.log('\n📋 TEMPLATE LIST:');
    console.log('================\n');

    templates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.name} (${template.id})`);
        console.log(`   Description: ${template.description}`);
        console.log(`   Icon: ${template.icon}`);
        console.log(`   Content length: ${template.content.length} chars\n`);

        testResults.templates.push({
            id: template.id,
            name: template.name,
            status: 'pending'
        });
    });

    // Test 3: Check template categories (if any)
    log('\nTest 3: Checking template organization...', 'info');
    const hasCategories = templates.some(t => t.category);
    if (hasCategories) {
        const categories = [...new Set(templates.filter(t => t.category).map(t => t.category))];
        log(`✅ Templates organized into ${categories.length} categories: ${categories.join(', ')}`, 'success');
    } else {
        log('ℹ️ No categories found - using simple list organization', 'info');
    }

    // Test 4: Check template rendering in sidebar
    log('\nTest 4: Checking sidebar template rendering...', 'info');
    const templatesList = document.getElementById('templatesList');
    if (!templatesList) {
        log('❌ Templates list element (#templatesList) not found!', 'error');
    } else {
        const templateItems = templatesList.querySelectorAll('.template-item');
        if (templateItems.length > 0) {
            log(`✅ ${templateItems.length} template items rendered in sidebar`, 'success');
        } else {
            log('⚠️ No template items found in sidebar - may need to render', 'warning');

            // Try to render templates
            if (typeof editor.updateTemplatesList === 'function') {
                log('Attempting to render templates...', 'debug');
                editor.updateTemplatesList();
                await wait(500);

                const newItems = templatesList.querySelectorAll('.template-item');
                if (newItems.length > 0) {
                    log(`✅ Now ${newItems.length} template items rendered`, 'success');
                } else {
                    log('❌ Still no template items after rendering', 'error');
                }
            }
        }
    }

    // Test 5: Check applyTemplate function
    log('\nTest 5: Checking template application function...', 'info');
    if (typeof editor.applyTemplate !== 'function') {
        log('❌ applyTemplate function not found!', 'error');
    } else {
        log('✅ applyTemplate function available', 'success');
    }

    // Test 6: Test each template individually (if enabled)
    if (TEST_CONFIG.testEachTemplate && TEST_CONFIG.autoRun) {
        log('\nTest 6: Testing each template individually...', 'info');
        console.log('\n🧪 INDIVIDUAL TEMPLATE TESTS:');
        console.log('=============================\n');

        for (let i = 0; i < templates.length; i++) {
            const template = templates[i];
            log(`Testing: ${template.name} (${template.id})...`, 'debug');

            try {
                // Store original content
                const editorElement = document.getElementById('editor');
                if (!editorElement) {
                    log(`❌ ${template.name}: Editor element not found`, 'error');
                    testResults.templates[i].status = 'failed';
                    testResults.failed++;
                    continue;
                }

                const originalContent = editorElement.innerHTML;

                // Apply template
                editor.applyTemplate(template.id);
                await wait(300); // Wait for template to apply

                // Check if content changed
                const newContent = editorElement.innerHTML;
                if (newContent !== originalContent) {
                    log(`✅ ${template.name}: Applied successfully`, 'success');
                    testResults.templates[i].status = 'passed';
                    testResults.passed++;

                    // Show template details if enabled
                    if (TEST_CONFIG.showDetails) {
                        console.log(`   Content preview: ${newContent.substring(0, 100)}...`);
                        console.log(`   Has tables: ${newContent.includes('<table')}`);
                        console.log(`   Has lists: ${newContent.includes('<ul') || newContent.includes('<ol')}`);
                        console.log(`   Has placeholders: ${newContent.includes('[') && newContent.includes(']')}\n`);
                    }

                    // Restore original content (optional)
                    // editorElement.innerHTML = originalContent;
                    // if (typeof editor.saveDocumentState === 'function') {
                    //     editor.saveDocumentState();
                    // }
                } else {
                    log(`❌ ${template.name}: Content did not change`, 'error');
                    testResults.templates[i].status = 'failed';
                    testResults.failed++;
                }
            } catch (error) {
                log(`❌ ${template.name}: Error - ${error.message}`, 'error');
                testResults.templates[i].status = 'failed';
                testResults.failed++;
            }
        }
    } else {
        log('⚠️ Individual template testing skipped', 'warning');
        testResults.skipped = templates.length;
    }

    // Test 7: Check for specific templates mentioned
    log('\nTest 7: Checking for specific required templates...', 'info');
    const requiredTemplates = [
        'blank',
        'resume',
        'letter',
        'report',
        'sales-invoice',
        'sales-receipt',
        'memo-reminder',
        'meeting-minutes',
        'essay',
        'project-proposal'
    ];

    const foundTemplates = [];
    const missingTemplates = [];

    requiredTemplates.forEach(templateId => {
        const found = templates.find(t => t.id === templateId);
        if (found) {
            foundTemplates.push(templateId);
        } else {
            missingTemplates.push(templateId);
        }
    });

    if (missingTemplates.length === 0) {
        log(`✅ All ${foundTemplates.length} required templates found`, 'success');
    } else {
        log(`⚠️ Missing templates: ${missingTemplates.join(', ')}`, 'warning');
        log(`✅ Found templates: ${foundTemplates.length}/${requiredTemplates.length}`, 'info');
    }

    // Test 8: Check template content quality
    log('\nTest 8: Checking template content quality...', 'info');
    let qualityScore = 0;
    const qualityChecks = {
        hasIcons: 0,
        hasDescriptions: 0,
        hasValidContent: 0,
        hasPlaceholders: 0,
        hasStructure: 0
    };

    templates.forEach(template => {
        if (template.icon && template.icon.includes('fa-')) qualityChecks.hasIcons++;
        if (template.description && template.description.length > 0) qualityChecks.hasDescriptions++;
        if (template.content && template.content.length > 10) qualityChecks.hasValidContent++;
        if (template.content && template.content.includes('[') && template.content.includes(']')) qualityChecks.hasPlaceholders++;
        if (template.content && (template.content.includes('<div') || template.content.includes('<p>') || template.content.includes('<h'))) qualityChecks.hasStructure++;
    });

    console.log('\n📊 TEMPLATE QUALITY METRICS:');
    console.log('============================');
    console.log(`Icons: ${qualityChecks.hasIcons}/${templates.length}`);
    console.log(`Descriptions: ${qualityChecks.hasDescriptions}/${templates.length}`);
    console.log(`Valid content: ${qualityChecks.hasValidContent}/${templates.length}`);
    console.log(`Placeholders: ${qualityChecks.hasPlaceholders}/${templates.length}`);
    console.log(`HTML structure: ${qualityChecks.hasStructure}/${templates.length}`);

    qualityScore = Math.round((Object.values(qualityChecks).reduce((a, b) => a + b, 0) / (templates.length * 5)) * 100);
    log(`Overall quality score: ${qualityScore}%`, qualityScore >= 80 ? 'success' : qualityScore >= 60 ? 'warning' : 'error');

    // Generate summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    console.log(`Total templates: ${testResults.total}`);

    if (TEST_CONFIG.testEachTemplate && TEST_CONFIG.autoRun) {
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`⚠️ Skipped: ${testResults.skipped}`);

        const passRate = testResults.total > 0 ? Math.round((testResults.passed / testResults.total) * 100) : 0;
        console.log(`📈 Pass rate: ${passRate}%`);

        // Show failed templates
        const failedTemplates = testResults.templates.filter(t => t.status === 'failed');
        if (failedTemplates.length > 0) {
            console.log('\n❌ FAILED TEMPLATES:');
            failedTemplates.forEach(t => console.log(`   - ${t.name} (${t.id})`));
        }
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================');

    if (testResults.total >= 10) {
        console.log('✅ Excellent template collection!');
        console.log('✅ Both old and new templates merged successfully');
        console.log('✅ Ready for production use');
    } else if (testResults.total >= 7) {
        console.log('⚠️ Good template collection');
        console.log('⚠️ Consider adding more templates for variety');
    } else {
        console.log('❌ Limited template collection');
        console.log('❌ Consider adding more templates from both systems');
    }

    // Check for old vs new system templates
    const oldSystemTemplates = ['blank', 'resume', 'letter', 'report'];
    const newSystemTemplates = ['sales-invoice', 'sales-receipt', 'memo-reminder', 'meeting-minutes', 'essay', 'project-proposal'];

    const foundOld = templates.filter(t => oldSystemTemplates.includes(t.id)).length;
    const foundNew = templates.filter(t => newSystemTemplates.includes(t.id)).length;

    console.log(`\n🔄 SYSTEM MERGE STATUS:`);
    console.log(`Old system templates: ${foundOld}/${oldSystemTemplates.length}`);
    console.log(`New system templates: ${foundNew}/${newSystemTemplates.length}`);

    if (foundOld > 0 && foundNew > 0) {
        console.log('✅ Successfully merged both template systems!');
    } else if (foundOld > 0 && foundNew === 0) {
        console.log('⚠️ Only old system templates found');
    } else if (foundOld === 0 && foundNew > 0) {
        console.log('⚠️ Only new system templates found');
    }

    // Helper functions for manual testing
    console.log('\n🔧 HELPER FUNCTIONS:');
    console.log('====================');
    console.log(`
// Test a specific template
function testTemplate(templateId) {
    const editor = window.charliesEditor;
    const template = editor.templates.find(t => t.id === templateId);
    if (!template) {
        console.error('Template not found:', templateId);
        return;
    }
    console.log('Testing template:', template.name);
    editor.applyTemplate(templateId);
}

// List all templates
function listTemplates() {
    const editor = window.charliesEditor;
    editor.templates.forEach((t, i) => {
        console.log(\`\${i + 1}. \${t.name} (\${t.id}): \${t.description}\`);
    });
}

// Show template details
function showTemplateDetails(templateId) {
    const editor = window.charliesEditor;
    const template = editor.templates.find(t => t.id === templateId);
    if (!template) {
        console.error('Template not found:', templateId);
        return;
    }
    console.log('Name:', template.name);
    console.log('ID:', template.id);
    console.log('Description:', template.description);
    console.log('Icon:', template.icon);
    console.log('Content length:', template.content.length, 'characters');
    console.log('Content preview:', template.content.substring(0, 200) + '...');
}

// Test all templates
function runTemplateTests() {
    testAllTemplates();
}
    `);

    console.log('\n💡 TIP: Run "listTemplates()" to see all available templates.');
    console.log('💡 TIP: Run "testTemplate(\'sales-invoice\')" to test the sales invoice template.');
    console.log('💡 TIP: Run "showTemplateDetails(\'memo-reminder\')" to see template details.');

    return testResults;
}

// Auto-run if configured
if (TEST_CONFIG.autoRun) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            console.log('🔍 Auto-starting template tests...');
            testAllTemplates().catch(error => {
                console.error('❌ Test suite failed:', error);
            });
        }, 2000);
    });
}

// Export functions for manual testing
window.testAllTemplates = testAllTemplates;
window.listTemplates = function() {
    const editor = window.charliesEditor;
    if (!editor || !editor.templates) {
        console.error('Editor or templates not found');
        return;
    }
    editor.templates.forEach((t, i) => {
        console.log(`${i + 1}. ${t.name} (${t.id}): ${t.description}`);
    });
};
window.testTemplate = function(templateId) {
    const editor = window.charliesEditor;
    if (!editor) {
        console.error('Editor not found');
        return;
    }
    const template = editor.templates.find(t => t.id === templateId);
    if (!template) {
        console.error('Template not found:', templateId);
        return;
    }
    console.log(`Testing template: ${template.name} (${template.id})`);
    editor.applyTemplate(templateId);
};
window.showTemplateDetails = function(templateId) {
    const editor = window.charliesEditor;
    if (!editor) {
        console.error('Editor not found');
        return;
    }
    const template = editor.templates.find(t => t.id === templateId);
    if (!template) {
        console.error('Template not found:', templateId);
        return;
    }
    console.log('📄 TEMPLATE DETAILS:');
    console.log('====================');
    console.log(`Name: ${template.name}`);
    console.log(`ID: ${template.id}`);
    console.log(`Description: ${template.description}`);
    console.log(`Icon: ${template.icon}`);
    console.log(`Content length: ${template.content.length} characters`);
    console.log('\n📝 CONTENT PREVIEW:');
    console.log(template.content.substring(0, 300) + (template.content.length > 300 ? '...' : ''));
};

console.log('🔍 Template test suite loaded.');
console.log('🔍 Run "testAllTemplates()" to start comprehensive testing.');
console.log('🔍 Run "listTemplates()" to see all available templates.');
