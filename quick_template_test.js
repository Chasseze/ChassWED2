/**
 * Quick Template Test for CharlesWebEditor
 * Run this in browser console to test if templates are working
 */

(function() {
    console.log('🔍 ============================================');
    console.log('🔍 CharlesWebEditor - Quick Template Test');
    console.log('🔍 ============================================\n');

    // Check if editor is loaded
    if (typeof window.charliesEditor === 'undefined') {
        console.log('❌ ERROR: Editor not found!');
        console.log('   Make sure the editor is running and main.js is loaded.');
        console.log('   Try refreshing the page or checking browser console for errors.');
        return;
    }

    const editor = window.charliesEditor;
    console.log(`✅ Editor found: v${editor.version} (${editor.releaseDate})`);

    // Check templates array
    if (!editor.templates || !Array.isArray(editor.templates)) {
        console.log('❌ ERROR: Templates array not found!');
        return;
    }

    const templates = editor.templates;
    console.log(`✅ Found ${templates.length} templates:\n`);

    // List all templates
    templates.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.name} (${template.id})`);
        console.log(`      Description: ${template.description}`);
        console.log(`      Icon: ${template.icon}`);
        console.log(`      Content length: ${template.content.length} characters\n`);
    });

    // Check if templates are rendered in sidebar
    const templatesList = document.getElementById('templatesList');
    if (!templatesList) {
        console.log('❌ ERROR: Templates list element (#templatesList) not found!');
        console.log('   Check if sidebar is loaded and templates tab is active.');
    } else {
        const templateItems = templatesList.querySelectorAll('.template-item');
        if (templateItems.length > 0) {
            console.log(`✅ ${templateItems.length} template items rendered in sidebar`);
        } else {
            console.log('⚠️ WARNING: No template items found in sidebar');
            console.log('   Templates might not be rendered yet.');
            console.log('   Trying to render templates...');

            if (typeof editor.updateTemplatesList === 'function') {
                editor.updateTemplatesList();
                setTimeout(() => {
                    const newItems = document.querySelectorAll('.template-item');
                    console.log(`   After update: ${newItems.length} template items found`);
                }, 500);
            }
        }
    }

    // Check applyTemplate function
    if (typeof editor.applyTemplate !== 'function') {
        console.log('❌ ERROR: applyTemplate function not found!');
    } else {
        console.log('✅ applyTemplate function available');

        // Test with first template
        if (templates.length > 0) {
            const testTemplate = templates[0];
            console.log(`\n🔧 Test command: editor.applyTemplate('${testTemplate.id}')`);
            console.log(`   This will apply: ${testTemplate.name}`);
        }
    }

    // Check sidebar tabs
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    const templatesTab = Array.from(sidebarTabs).find(tab =>
        tab.textContent.includes('Templates') ||
        tab.getAttribute('data-tab') === 'templates'
    );

    if (!templatesTab) {
        console.log('❌ ERROR: Templates tab not found in sidebar!');
    } else {
        console.log('✅ Templates tab found in sidebar');

        // Check if templates tab is active
        if (templatesTab.classList.contains('active')) {
            console.log('✅ Templates tab is active (visible)');
        } else {
            console.log('⚠️ WARNING: Templates tab is not active');
            console.log('   Click the "Templates" tab in sidebar to see templates');
            console.log('   Or run: document.querySelector(\'[data-tab="templates"]\').click()');
        }
    }

    // Check editor element
    const editorElement = document.getElementById('editor');
    if (!editorElement) {
        console.log('❌ ERROR: Editor element (#editor) not found!');
    } else {
        console.log('✅ Editor element found');
        console.log(`   Current content length: ${editorElement.innerHTML.length} characters`);
        console.log(`   Content editable: ${editorElement.contentEditable}`);
    }

    // Summary
    console.log('\n📊 ===============================');
    console.log('📊 TEST SUMMARY');
    console.log('📊 ===============================\n');

    const tests = [
        { name: 'Editor loaded', passed: typeof window.charliesEditor !== 'undefined' },
        { name: 'Templates array exists', passed: editor.templates && Array.isArray(editor.templates) },
        { name: 'Templates found', passed: templates.length > 0 },
        { name: 'applyTemplate function', passed: typeof editor.applyTemplate === 'function' },
        { name: 'Templates tab exists', passed: !!templatesTab },
        { name: 'Editor element exists', passed: !!editorElement }
    ];

    let passed = 0;
    tests.forEach(test => {
        const icon = test.passed ? '✅' : '❌';
        console.log(`${icon} ${test.name}`);
        if (test.passed) passed++;
    });

    console.log(`\n📈 Results: ${passed}/${tests.length} tests passed`);

    if (passed === tests.length) {
        console.log('\n🎉 SUCCESS: All template tests passed!');
        console.log('\n🔧 To test a template, run in console:');
        templates.forEach(template => {
            console.log(`   editor.applyTemplate('${template.id}')  // ${template.name}`);
        });
    } else if (passed >= tests.length * 0.7) {
        console.log('\n⚠️ WARNING: Most tests passed, but some issues found.');
        console.log('   Templates should work, but check the failed tests above.');
    } else {
        console.log('\n❌ CRITICAL: Multiple tests failed.');
        console.log('   Templates may not work properly.');
    }

    // Helper functions for manual testing
    console.log('\n🔧 HELPER FUNCTIONS (copy/paste to use):\n');

    console.log(`// 1. Show all templates
function showTemplates() {
    const templates = window.charliesEditor.templates;
    templates.forEach(t => {
        console.log(\`\${t.name} (\${t.id}): \${t.description}\`);
    });
}`);

    console.log(`
// 2. Test a specific template
function testTemplate(templateId) {
    const editor = window.charliesEditor;
    const template = editor.templates.find(t => t.id === templateId);
    if (!template) {
        console.error('Template not found:', templateId);
        return;
    }
    console.log('Applying template:', template.name);
    editor.applyTemplate(templateId);
}`);

    console.log(`
// 3. Show sidebar templates
function showSidebarTemplates() {
    const templatesList = document.getElementById('templatesList');
    if (!templatesList) {
        console.error('Templates list not found');
        return;
    }
    const items = templatesList.querySelectorAll('.template-item');
    console.log(\`Found \${items.length} template items in sidebar\`);
    items.forEach((item, index) => {
        console.log(\`\${index + 1}. \${item.textContent}\`);
    });
}`);

    console.log(`
// 4. Activate templates tab
function showTemplatesTab() {
    const tab = document.querySelector('[data-tab="templates"]');
    if (tab) {
        tab.click();
        console.log('Templates tab activated');
    } else {
        console.error('Templates tab not found');
    }
}`);

    console.log('\n💡 TIP: Run "showTemplates()" to see all available templates.');
    console.log('💡 TIP: Run "testTemplate(\'blank\')" to test the blank template.');

})();
