const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 ChassWED2 Server Diagnostics\n');
console.log('='.repeat(50));

// Check 1: Node version
console.log('\n✓ Node.js version:', process.version);

// Check 2: Check if required modules exist
console.log('\n📦 Checking dependencies...');
try {
    const express = require('express');
    console.log('  ✓ Express module loaded');
} catch (err) {
    console.log('  ✗ Express module NOT found:', err.message);
    console.log('  → Run: npm install');
    process.exit(1);
}

// Check 3: Check if public files exist
console.log('\n📁 Checking public files...');
const requiredFiles = [
    'public/index.html',
    'public/main.js',
    'public/style.css'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`  ✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    } else {
        console.log(`  ✗ ${file} NOT FOUND`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Missing required files!');
    process.exit(1);
}

// Check 4: Check if port 3002 is available
console.log('\n🔌 Checking port availability...');
const testServer = http.createServer();

testServer.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log('  ✗ Port 3002 is already in use!');
        console.log('  → Options:');
        console.log('    1. Stop the process using port 3002');
        console.log('    2. Run: PORT=3003 npm start (to use different port)');
        process.exit(1);
    } else {
        console.log('  ✗ Port check error:', err.message);
        process.exit(1);
    }
});

testServer.once('listening', () => {
    console.log('  ✓ Port 3002 is available');
    testServer.close();

    // Check 5: Try to start the actual server
    console.log('\n🚀 Starting server test...');
    const express = require('express');
    const app = express();
    const PORT = 3002;

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    const server = app.listen(PORT, () => {
        console.log(`  ✓ Server started successfully!`);
        console.log(`  ✓ Listening on http://localhost:${PORT}`);

        // Make a test request
        console.log('\n📡 Testing HTTP request...');
        http.get(`http://localhost:${PORT}`, (res) => {
            console.log(`  ✓ HTTP Status: ${res.statusCode}`);
            console.log(`  ✓ Content-Type: ${res.headers['content-type']}`);

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.includes('CharlesWebEditor')) {
                    console.log('  ✓ HTML content loaded correctly');
                } else {
                    console.log('  ⚠ HTML content might be incorrect');
                }

                console.log('\n' + '='.repeat(50));
                console.log('\n✅ All diagnostics passed!');
                console.log('\n🎉 Your server is working correctly!');
                console.log('\n📝 To start the server, run:');
                console.log('   npm start');
                console.log('\n🌐 Then open in browser:');
                console.log('   http://localhost:3002');
                console.log('\n⏹️  To stop the server, press: Ctrl+C');
                console.log('\n' + '='.repeat(50) + '\n');

                server.close();
                process.exit(0);
            });
        }).on('error', (err) => {
            console.log('  ✗ HTTP request failed:', err.message);
            server.close();
            process.exit(1);
        });
    });

    server.on('error', (err) => {
        console.log('  ✗ Server failed to start:', err.message);
        process.exit(1);
    });
});

testServer.listen(3002);
