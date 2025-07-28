// test-scheduler.js - Run this to test your scheduler locally
// Make sure your dev server is running first: npm run dev

require('dotenv').config({ path: '.env.local' });

async function testHealthCheck() {
    console.log('🏥 Testing health check...');
    try {
        const response = await fetch('http://localhost:3000/api/scheduler/send-due-emails');
        const result = await response.json();
        console.log('✅ Health check result:', result);
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
    }
}

async function testScheduler() {
    console.log('🧪 Testing email scheduler...');

    if (!process.env.SCHEDULER_API_KEY) {
        console.error('❌ SCHEDULER_API_KEY not found in .env.local');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/scheduler/send-due-emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SCHEDULER_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Scheduler test successful!');
            console.log('📊 Results:', {
                processed: result.processed,
                successful: result.successful,
                failed: result.failed
            });

            if (result.results && result.results.length > 0) {
                console.log('📧 Email details:');
                result.results.forEach((email, index) => {
                    console.log(`  ${index + 1}. ${email.invoiceNumber} to ${email.clientEmail}: ${email.success ? '✅' : '❌'}`);
                });
            }
        } else {
            console.error('❌ Scheduler test failed:', result);
        }
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting scheduler tests...\n');
    await testHealthCheck();
    console.log(''); // Add spacing
    await testScheduler();
    console.log('\n✨ Tests completed!');
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
    console.log('Installing node-fetch for testing...');
    require('child_process').execSync('npm install node-fetch@2', { stdio: 'inherit' });
    global.fetch = require('node-fetch');
}

runTests();