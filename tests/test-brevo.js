// test-brevo-debug.js - Debug the Brevo SDK
require('dotenv').config({ path: '.env.local' });

async function debugBrevoSDK() {
    console.log('🔍 Debugging Brevo SDK...\n');
    
    // Check environment
    if (!process.env.BREVO_API_KEY) {
        console.error('❌ BREVO_API_KEY not found');
        return;
    }
    
    console.log('✅ API Key found:', process.env.BREVO_API_KEY.substring(0, 15) + '...');
    
    try {
        // Try to require Brevo
        console.log('📦 Loading Brevo SDK...');
        const brevo = require('@getbrevo/brevo');
        console.log('✅ Brevo SDK loaded successfully');
        
        // Check what's available
        console.log('🔍 Available in brevo object:');
        console.log('- ApiClient:', typeof brevo.ApiClient);
        console.log('- TransactionalEmailsApi:', typeof brevo.TransactionalEmailsApi);
        console.log('- SendSmtpEmail:', typeof brevo.SendSmtpEmail);
        
        // Try to get default client
        console.log('\n🔧 Initializing API client...');
        const defaultClient = brevo.ApiClient.instance;
        console.log('✅ Default client obtained');
        
        // Check authentications object
        console.log('🔍 Checking authentications:');
        console.log('- authentications type:', typeof defaultClient.authentications);
        console.log('- authentications keys:', Object.keys(defaultClient.authentications || {}));
        
        // Try different ways to set API key
        if (defaultClient.authentications && defaultClient.authentications['api-key']) {
            console.log('✅ Found api-key authentication');
            defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
            console.log('✅ API key set via authentications');
        } else {
            console.log('⚠️ api-key authentication not found, trying defaultHeaders');
            defaultClient.defaultHeaders = defaultClient.defaultHeaders || {};
            defaultClient.defaultHeaders['api-key'] = process.env.BREVO_API_KEY;
            console.log('✅ API key set via defaultHeaders');
        }
        
        // Try to create TransactionalEmailsApi
        console.log('\n📧 Creating TransactionalEmailsApi...');
        const apiInstance = new brevo.TransactionalEmailsApi();
        console.log('✅ TransactionalEmailsApi created');
        
        // Try to create a simple email object
        console.log('\n✉️ Creating test email object...');
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = 'Test Subject';
        sendSmtpEmail.htmlContent = '<p>Test content</p>';
        sendSmtpEmail.sender = { name: 'Test', email: 'noreply@sendinblue.com' };
        sendSmtpEmail.to = [{ email: 'test@example.com', name: 'Test User' }];
        console.log('✅ Email object created successfully');
        
        console.log('\n🎉 All SDK operations successful!');
        console.log('💡 The issue might be in the runtime environment.');
        
        return true;
        
    } catch (error) {
        console.error('❌ SDK Error:', error);
        console.error('Stack:', error.stack);
        return false;
    }
}

async function testDirectAPI() {
    console.log('\n🌐 Testing direct API call...');
    
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { name: 'Nudgr Test', email: 'noreply@sendinblue.com' },
                to: [{ email: 'rohitcodes03@gmail.com', name: 'Test User' }],
                subject: 'Direct API Test',
                htmlContent: '<p>This is a direct API test from Nudgr!</p>'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Direct API call successful!');
            console.log('📨 Message ID:', result.messageId);
            console.log('💌 Check your email for the test message');
            return true;
        } else {
            console.error('❌ API call failed:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ Direct API error:', error);
        return false;
    }
}

async function main() {
    const sdkTest = await debugBrevoSDK();
    
    if (sdkTest) {
        console.log('\n✅ SDK test passed - trying direct API...');
        await testDirectAPI();
    } else {
        console.log('\n❌ SDK test failed - trying direct API anyway...');
        await testDirectAPI();
    }
}

// Ensure fetch is available
if (typeof fetch === 'undefined') {
    global.fetch = require('node-fetch');
}

main();