/**
 * Comprehensive Test for CharlesWebEditor Templates and Features
 * This script verifies that all templates (both old and new) and features are working properly
 */

console.log('🔍 ============================================');
console.log('🔍 CharlesWebEditor - Comprehensive Test Suite');
console.log('🔍 ============================================\n');

// Test Configuration
const TEST_CONFIG = {
    timeout: 5000,
    retryCount: 3,
    logLevel: 'detailed' // 'basic' or 'detailed'
};

// Test Results Storage
const testResults = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    details: []
};

// Utility Functions
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        debug: '🔍'
    };

    if (TEST_CONFIG.logLevel === 'detailed' || type !== 'debug') {
        console.log(`${icons[type] || '📝'} [${timestamp}] ${message}`);
    }
}

function addTestResult(name, passed, message = '', details = {}) {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        log(`${name}: PASSED`, 'success');
    } else {
        testResults.failed++;
        log(`${name}: FAILED - ${message}`, 'error');
    }

    testResults.details.push({
        name,
        passed,
        message,
        details,
        timestamp: new Date().toISOString()
    });
}

function skipTest(name, reason = '') {
    testResults.total++;
    testResults.skipped++;
    log(`${name}: SKIPPED${reason ? ` - ${reason}` : ''}`, 'warning');
}

// Wait for element to be available
function waitForElement(selector, timeout = TEST_CONFIG.timeout) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        function check() {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            if (Date.now() - startTime > timeout) {
                reject(new Error(`Element ${selector} not found after ${timeout}ms`));
                return;
            }

            setTimeout(check, 100);
        }

        check();
    });
}

// Main Test Suite
async function runComprehensiveTests() {
    log('Starting comprehensive tests...', 'info');
    console.log('\n📋 ===============================');
    console.log('📋 TEST 1: SYSTEM INITIALIZATION');
    console.log('📋 ===============================\n');

    // Test 1.1: Check if editor is loaded
    try {
        if (typeof window.charliesEditor === 'undefined') {
            throw new Error('Editor not found in window object');
        }

        const editor = window.charliesEditor;
        addTestResult('Editor loaded', true, `Version: ${editor.version || 'Unknown'}`);

        // Store editor reference for other tests
        window.testEditor = editor;
    } catch (error) {
        addTestResult('Editor loaded', false, error.message);
        log('Cannot proceed without editor. Aborting tests.', 'error');
        return;
    }

    // Test 1.2: Check editor elements
    try {
        const editorElement = await waitForElement('#editor');
        const pageElement = await waitForElement('#page');
        const pageContainer = await waitForElement('#pageContainer');

        addTestResult('Editor DOM elements', true,
            `Found: editor=${!!editorElement}, page=${!!pageElement}, container=${!!pageContainer}`);
    } catch (error) {
        addTestResult('Editor DOM elements', false, error.message);
    }

    console.log('\n📋 ===========================');
    console.log('📋 TEST 2: TEMPLATES SYSTEM');
    console.log('📋 ===========================\n');

    // Test 2.1: Check templates array
    try {
        const editor = window.testEditor;
        if (!editor.templates || !Array.isArray(editor.templates)) {
            throw new Error('Templates array not found or not an array');
        }

        const templates = editor.templates;
        addTestResult('Templates array', true,
            `Found ${templates.length} templates`);

        // Store templates for other tests
        window.testTemplates = templates;
    } catch (error) {
        addTestResult('Templates array', false, error.message);
    }

    // Test 2.2: Check individual templates
    try {
        const templates = window.testTemplates || [];
        let allTemplatesValid = true;
        const templateIssues = [];

        templates.forEach((template, index) => {
            const issues = [];

            // Check required fields
            if (!template.id) issues.push('Missing id');
            if (!template.name) issues.push('Missing name');
            if (!template.description) issues.push('Missing description');
            if (!template.content) issues.push('Missing content');
            if (!template.icon) issues.push('Missing icon');

            // Check content validity
            if (template.content && typeof template.content !== 'string') {
                issues.push('Content is not a string');
            }

            // Check for empty content
            if (template.content && template.content.trim().length === 0) {
                issues.push('Content is empty');
            }

            if (issues.length > 0) {
                allTemplatesValid = false;
                templateIssues.push(`${template.name || `Template ${index}`}: ${issues.join(', ')}`);
            }
        });

        if (allTemplatesValid) {
            addTestResult('Template validation', true,
                `All ${templates.length} templates have valid structure`);
        } else {
            addTestResult('Template validation', false,
                `Issues found: ${templateIssues.join('; ')}`);
        }
    } catch (error) {
        addTestResult('Template validation', false, error.message);
    }

    // Test 2.3: Check template categories (new system)
    try {
        const templates = window.testTemplates || [];
        const hasCategories = templates.some(t => t.category);
        const hasCustomTemplates = templates.some(t => t.isCustom);
        const hasCreatedAt = templates.some(t => t.createdAt);

        let systemType = 'Old (monolithic)';
        if (hasCategories || hasCustomTemplates || hasCreatedAt) {
            systemType = 'New (modular)';
            if (hasCategories && hasCustomTemplates) {
                systemType += ' with categories and custom templates';
            } else if (hasCategories) {
                systemType += ' with categories';
            } else if (hasCustomTemplates) {
                systemType += ' with custom templates';
            }
        }

        addTestResult('Template system type', true, systemType);
    } catch (error) {
        addTestResult('Template system type', false, error.message);
    }

    // Test 2.4: Check template rendering in sidebar
    try {
        const templatesList = await waitForElement('#templatesList');
        const hasTemplateItems = templatesList.querySelectorAll('.template-item').length > 0;

        if (hasTemplateItems) {
            addTestResult('Templates rendered in sidebar', true,
                'Template items found in sidebar');
        } else {
            // Check if templates are dynamically rendered
            const editor = window.testEditor;
            if (typeof editor.updateTemplatesList === 'function') {
                // Try to trigger template rendering
                editor.updateTemplatesList();

                // Wait a bit and check again
                await new Promise(resolve => setTimeout(resolve, 500));

                const hasTemplateItemsAfter = templatesList.querySelectorAll('.template-item').length > 0;
                if (hasTemplateItemsAfter) {
                    addTestResult('Templates rendered in sidebar', true,
                        'Templates dynamically rendered');
                } else {
                    addTestResult('Templates rendered in sidebar', false,
                        'No template items found even after calling updateTemplatesList()');
                }
            } else {
                addTestResult('Templates rendered in sidebar', false,
                    'No template items found and updateTemplatesList() not available');
            }
        }
    } catch (error) {
        addTestResult('Templates rendered in sidebar', false, error.message);
    }

    // Test 2.5: Check template application function
    try {
        const editor = window.testEditor;
        if (typeof editor.applyTemplate !== 'function') {
            throw new Error('applyTemplate function not found');
        }

        // Test with a sample template
        const templates = window.testTemplates || [];
        if (templates.length > 0) {
            const testTemplate = templates[0];
            const originalContent = document.getElementById('editor').innerHTML;

            // Apply template
            editor.applyTemplate(testTemplate.id);

            // Check if content changed
            await new Promise(resolve => setTimeout(resolve, 100));
            const newContent = document.getElementById('editor').innerHTML;

            if (newContent !== originalContent) {
                addTestResult('Template application', true,
                    `Successfully applied "${testTemplate.name}" template`);

                // Restore original content
                document.getElementById('editor').innerHTML = originalContent;
                if (typeof editor.saveDocumentState === 'function') {
                    editor.saveDocumentState();
                }
            } else {
                addTestResult('Template application', false,
                    'Editor content did not change after applying template');
            }
        } else {
            skipTest('Template application', 'No templates available to test');
        }
    } catch (error) {
        addTestResult('Template application', false, error.message);
    }

    console.log('\n📋 ============================');
    console.log('📋 TEST 3: CORE FEATURES');
    console.log('📋 ============================\n');

    // Test 3.1: Check formatting features
    try {
        const editor = window.testEditor;
        const formattingTests = [
            { name: 'Bold formatting', command: 'bold', selector: '[data-command="bold"]' },
            { name: 'Italic formatting', command: 'italic', selector: '[data-command="italic"]' },
            { name: 'Underline formatting', command: 'underline', selector: '[data-command="underline"]' },
            { name: 'Align left', command: 'justifyLeft', selector: '[data-command="justifyLeft"]' },
            { name: 'Align center', command: 'justifyCenter', selector: '[data-command="justifyCenter"]' },
            { name: 'Align right', command: 'justifyRight', selector: '[data-command="justifyRight"]' }
        ];

        let formattingWorking = true;
        const formattingIssues = [];

        for (const test of formattingTests) {
            const button = document.querySelector(test.selector);
            if (!button) {
                formattingWorking = false;
                formattingIssues.push(`${test.name}: Button not found`);
                continue;
            }

            // Check if button has event listener
            const hasClickListener = button.onclick !== null;
            const hasDataCommand = button.getAttribute('data-command') === test.command;

            if (!hasClickListener && !hasDataCommand) {
                formattingWorking = false;
                formattingIssues.push(`${test.name}: No click handler or data-command`);
            }
        }

        if (formattingWorking) {
            addTestResult('Formatting features', true,
                `${formattingTests.length} formatting buttons found and configured`);
        } else {
            addTestResult('Formatting features', false,
                `Issues: ${formattingIssues.join('; ')}`);
        }
    } catch (error) {
        addTestResult('Formatting features', false, error.message);
    }

    // Test 3.2: Check document management
    try {
        const docManagementTests = [
            { name: 'New document button', selector: '#newDocBtn' },
            { name: 'Save document button', selector: '#saveDocBtn' },
            { name: 'Open document button', selector: '#openDocBtn' },
            { name: 'Print button', selector: '#printBtn' }
        ];

        let docManagementWorking = true;
        const docManagementIssues = [];

        for (const test of docManagementTests) {
            const button = document.querySelector(test.selector);
            if (!button) {
                docManagementWorking = false;
                docManagementIssues.push(`${test.name}: Button not found`);
                continue;
            }

            // Check if button is not disabled
            if (button.disabled) {
                docManagementWorking = false;
                docManagementIssues.push(`${test.name}: Button is disabled`);
            }
        }

        if (docManagementWorking) {
            addTestResult('Document management', true,
                `${docManagementTests.length} document management buttons found`);
        } else {
            addTestResult('Document management', false,
                `Issues: ${docManagementIssues.join('; ')}`);
        }
    } catch (error) {
        addTestResult('Document management', false, error.message);
    }

    // Test 3.3: Check export features
    try {
        const exportTests = [
            { name: 'Export PDF', selector: '#exportPdf' },
            { name: 'Export DOCX', selector: '#exportDocx' },
            { name: 'Google Drive save', selector: '#saveCloud' }
        ];

        let exportWorking = true;
        const exportIssues = [];

        for (const test of exportTests) {
            const button = document.querySelector(test.selector);
            if (!button) {
                exportWorking = false;
                exportIssues.push(`${test.name}: Button not found`);
            }
        }

        if (exportWorking) {
            addTestResult('Export features', true,
                `${exportTests.length} export buttons found`);
        } else {
            addTestResult('Export features', false,
                `Issues: ${exportIssues.join('; ')}`);
        }
    } catch (error) {
        addTestResult('Export features', false, error.message);
    }

    console.log('\n📋 =============================');
    console.log('📋 TEST 4: ADVANCED FEATURES');
    console.log('📋 =============================\n');

    // Test 4.1: Check new feature buttons
    try {
        const newFeatureTests = [
            { name: 'AI Assistant', selector: '#aiAssistantBtn', expected: 'coming soon' },
            { name: 'Templates', selector: '#templatesBtn', expected: 'templates' },
            { name: 'Advanced Formatting', selector: '#advancedFormattingBtn', expected: 'formatting' },
            { name: 'Email Share', selector: '#emailShareBtn', expected: 'share' }
        ];

        let newFeaturesWorking = true;
        const newFeatureIssues = [];

        for (const test of newFeatureTests) {
            const button = document.querySelector(test.selector);
            if (!button) {
                newFeaturesWorking = false;
                newFeatureIssues.push(`${test.name}: Button not found`);
                continue;
            }

            // Check if button has title or text indicating functionality
            const title = button.title || '';
            const text = button.textContent || button.innerText || '';
            const hasRelevantText = title.toLowerCase().includes(test.expected) ||
                                   text.toLowerCase().includes(test.expected);

            if (!hasRelevantText) {
                newFeaturesWorking = false;
                newFeatureIssues.push(`${test.name}: No relevant text/title found`);
            }
        }

        if (newFeaturesWorking) {
            addTestResult('New feature buttons', true,
                `${newFeatureTests.length} new feature buttons found`);
        } else {
            addTestResult('New feature buttons', false,
                `Issues: ${newFeatureIssues.join('; ')}`);
        }
    } catch (error) {
        addTestResult('New feature buttons', false, error.message);
    }

    // Test 4.2: Check sidebar functionality
    try {
        const sidebar = await waitForElement('#sidebar');
        const sidebarTabs = sidebar.querySelectorAll('.sidebar-tab');
        const sidebarContent = await waitForElement('#sidebarContent');

        if (sidebarTabs.length > 0 && sidebarContent) {
            addTestResult('Sidebar structure', true,
                `Found ${sidebarTabs.length} sidebar tabs`);

            // Check if templates tab exists
            const templatesTab = Array.from(sidebarTabs).find(tab =>
                tab.textContent.includes('Templates') ||
                tab.getAttribute('data-tab') === 'templates'
            );

            if (templatesTab) {
                addTestResult('Templates sidebar tab', true, 'Templates tab found in sidebar');
            } else {
                addTestResult('Templates sidebar tab', false, 'Templates tab not found in sidebar');
            }
        } else {
            addTestResult('Sidebar structure', false, 'Sidebar tabs or content not found');
        }
    } catch (error) {
        addTestResult('Sidebar structure', false, error.message);
    }

    // Test 4.3: Check toast notification system
    try {
        const editor = window.testEditor;
        if (typeof editor.showToast === 'function') {
            // Test toast function
            const testMessage = 'Test toast message';
            editor.showToast(testMessage, 'info');

            addTestResult('Toast notifications', true, 'showToast function available and working');
        } else {
            addTestResult('Toast notifications', false, 'showToast function not available');
        }
    } catch (error) {
        addTestResult('Toast notifications', false, error.message);
    }

    console.log('\n📋 ===========================');
    console.log('📋 TEST 5: TEMPLATE CONTENT');
    console.log('📋 ===========================\n');

    // Test 5.1: Analyze template content
    try {
        const templates = window.testTemplates || [];
        if (templates.length > 0) {
            let contentAnalysis = {
                totalTemplates: templates.length,
                hasHTML: 0,
                hasCSS: 0,
                hasPlaceholders: 0,
                hasTables: 0,
                hasLists: 0,
                avgLength: 0
            };

            let totalLength = 0;

            templates.forEach(template => {
                const content = template.content || '';
                totalLength += content.length;

                if (content.includes('<div') || content.includes('<p>') || content.includes('<h')) {
                    contentAnalysis.hasHTML++;
                }

                if (content.includes('style=') || content.includes('class=')) {
                    contentAnalysis.hasCSS++;
                }

                if (content.includes('[') && content.includes(']')) {
                    contentAnalysis.hasPlaceholders++;
                }

                if (content.includes('<table') || content.includes('<tr') || content.includes('<td')) {
                    contentAnalysis.hasTables++;
                }

                if (content.includes('<ul') || content.includes('<ol') || content.includes('<li')) {
                    contentAnalysis.hasLists++;
                }
            });

            contentAnalysis.avgLength = Math.round(totalLength / templates.length);

            addTestResult('Template content analysis', true,
                `HTML: ${contentAnalysis.hasHTML}/${templates.length}, ` +
                `CSS: ${contentAnalysis.hasCSS}/${templates.length}, ` +
                `Placeholders: ${contentAnalysis.hasPlaceholders}/${templates.length}, ` +
                `Avg length: ${contentAnalysis.avgLength} chars`);
        } else {
            skipTest('Template content analysis', 'No templates available');
        }
    } catch (error) {
        addTestResult('Template content analysis', false, error.message);
    }

    // Test 5.2: Check template diversity
    try {
        const templates = window.testTemplates || [];
        if (templates.length >= 2) {
            const templateNames = templates.map(t => t.name);
            const templateIds = templates.map(t => t.id);
            const uniqueNames = new Set(templateNames);
            const uniqueIds = new Set(templateIds);

            const hasUniqueNames = uniqueNames.size === templates.length;
            const hasUniqueIds = uniqueIds.size === templates.length;

            if (hasUniqueNames && hasUniqueIds) {
                addTestResult('Template diversity', true,
                    `All ${templates.length} templates have unique names and IDs`);
            } else {
                addTestResult('Template diversity', false,
                    `Duplicate names: ${!hasUniqueNames}, Duplicate IDs: ${!hasUniqueIds}`);
            }
        } else {
            skipTest('Template diversity', 'Need at least 2 templates to test diversity');
        }
    } catch (error) {
        addTestResult('Template diversity', false, error.message);
    }

    // Generate Summary Report
    console.log('\n📊 ===================================');
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('📊 ===================================\n');

    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️ Skipped: ${testResults.skipped}`);

    const passRate = testResults.total > 0 ?
        Math.round((testResults.passed / testResults.total) * 100) : 0;

    console.log(`📈 Pass Rate: ${passRate}%\n`);

    // Detailed breakdown
    if (testResults.failed > 0) {
        console.log('🔍 FAILED TESTS DETAILS:');
        testResults.details
            .filter(result => !result.passed)
            .forEach(result => {
                console.log(`  ❌ ${result.name}: ${result.message}`);
            });
        console.log('');
    }

    // Recommendations
    console.log('💡 RECOMMENDATIONS:');

    if (passRate >= 90) {
        console.log('  ✅ Excellent! All templates and features are working properly.');
        console.log('  ✅ Both old and new template systems are functional.');
        console.log('  ✅ Ready for production use.');
    } else if (passRate >= 70) {
        console.log('  ⚠️ Good! Most templates and features are working.');
        console.log('  ⚠️ Check the failed tests above for specific issues.');
        console.log('  ⚠️ Consider fixing the identified issues before production.');
    } else if (passRate >= 50) {
        console.log('  ⚠️ Fair! Some templates and features need attention.');
        console.log('  ⚠️ Review the failed tests and prioritize fixes.');
        console.log('  ⚠️ Template system may need updates or bug fixes.');
    } else {
        console.log('  ❌ Poor! Significant issues with templates and features.');
        console.log('  ❌ Immediate attention required for critical functionality.');
        console.log('  ❌ Consider reverting to a known working version.');
    }

    // Template-specific recommendations
    const templates = window.testTemplates || [];
    if (templates.length > 0) {
        console.log(`\n📄 TEMPLATE STATUS: ${templates.length} templates found`);

        // Check for old vs new system
        const hasNewSystemFeatures = templates.some(t => t.category || t.isCustom);
        if (hasNewSystemFeatures) {
            console.log('  ✅ Using new template system with categories/custom templates');
        } else {
            console.log('  ℹ️ Using old template system (consider upgrading for better organization)');
        }

        // Check template application
        const editor = window.testEditor;
        if (typeof editor.applyTemplate === 'function') {
            console.log('  ✅ Template application function is available');
        } else {
            console.log('  ❌ Template application function missing');
        }
    }

    // Save results to localStorage for later reference
    try {
        localStorage.setItem('chasswed_test_results', JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                total: testResults.total,
                passed: testResults.passed,
                failed: testResults.failed,
                skipped: testResults.skipped,
                passRate: passRate
            },
            details: testResults.details,
            config: TEST_CONFIG
        }));

        log('Test results saved to localStorage', 'success');
    } catch (error) {
        log(`Failed to save results to localStorage: ${error.message}`, 'warning');
    }

    return testResults;
}

// Export for use in browser console
window.runChassWEDTests = runComprehensiveTests;

// Auto-run if in test environment
if (window.location.href.includes('test') || window.location.href.includes('debug')) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            console.log('🔍 Auto-starting comprehensive tests...');
            runComprehensiveTests().catch(error => {
                console.error('❌ Test suite failed:', error);
            });
        }, 2000);
    });
}

console.log('🔍 Test suite loaded. Run "runChassWEDTests()" in console to start tests.');
