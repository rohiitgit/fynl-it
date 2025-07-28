// targeted-email-test.js - Test with your specific email
require('dotenv').config({ path: '.env.local' });

async function sendTargetedTest() {
    console.log('🎯 Targeted Email Test\n');

    if (!process.env.BREVO_API_KEY) {
        console.error('❌ No API key found');
        return;
    }

    // REPLACE THIS WITH YOUR ACTUAL EMAIL ADDRESS
    const YOUR_EMAIL = 'rohitdev100x@gmail.com'; // ← Change this to your email

    console.log('📧 Sending test email to:', YOUR_EMAIL);
    console.log('🔑 API Key:', process.env.BREVO_API_KEY.substring(0, 20) + '...');

    try {
        const emailPayload = {
            sender: {
                name: "Nudgr Test System",
                email: "noreply@sendinblue.com"
            },
            to: [{
                email: YOUR_EMAIL,
                name: "Test Recipient"
            }],
            subject: "🧪 Nudgr Brevo Integration Test - " + new Date().toLocaleTimeString(),
            htmlContent: `
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border: 2px solid #007bff;">
                        <h1 style="color: #007bff; text-align: center;">🎉 Brevo Integration Test</h1>
                        <p style="font-size: 18px; color: #333;">
                            <strong>Success!</strong> If you're reading this email, your Nudgr + Brevo integration is working perfectly.
                        </p>
                        <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #28a745;">✅ Integration Status: ACTIVE</h3>
                            <ul style="color: #666;">
                                <li>📧 Email delivery: Working</li>
                                <li>🔑 API authentication: Valid</li>
                                <li>⏰ Timestamp: ${new Date().toISOString()}</li>
                                <li>📨 Message ID will be logged in console</li>
                            </ul>
                        </div>
                        <p style="font-size: 14px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
                            This is an automated test email from Nudgr. You can safely delete this message.
                        </p>
                    </div>
                </body>
                </html>
            `,
            tags: ["nudgr-test", "integration-check"]
        };

        console.log('📤 Sending email payload...');
        console.log('📋 Payload preview:');
        console.log('   - To:', emailPayload.to[0].email);
        console.log('   - Subject:', emailPayload.subject);
        console.log('   - From:', emailPayload.sender.email);

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify(emailPayload)
        });

        const result = await response.json();

        console.log('\n📊 Response Details:');
        console.log('   - Status:', response.status);
        console.log('   - Status Text:', response.statusText);
        console.log('   - Response:', JSON.stringify(result, null, 2));

        if (response.ok) {
            console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
            console.log('📨 Message ID:', result.messageId);
            console.log('⏰ Sent at:', new Date().toLocaleString());
            console.log('\n📍 CHECK YOUR EMAIL NOW:');
            console.log('   1. Check inbox for:', YOUR_EMAIL);
            console.log('   2. Check spam/junk folder');
            console.log('   3. Look for subject: "🧪 Nudgr Brevo Integration Test"');
            console.log('   4. Wait up to 2-3 minutes for delivery');

            return true;
        } else {
            console.log('\n❌ EMAIL SEND FAILED:');
            console.log('Error:', result);
            return false;
        }
    } catch (error) {
        console.error('\n💥 UNEXPECTED ERROR:', error);
        return false;
    }
}

async function checkBrevoAccount() {
    console.log('\n🔍 Checking Brevo Account Status...');

    try {
        const response = await fetch('https://api.brevo.com/v3/account', {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY
            }
        });

        if (response.ok) {
            const account = await response.json();
            console.log('✅ Account Status: Active');
            console.log('📊 Plan:', account.plan?.type || 'Free');
            console.log('📧 Email Credits:', account.plan?.creditsType || 'Unlimited for free plan');

            // Check if there are any sending limits or issues
            if (account.relay && account.relay.enabled === false) {
                console.log('⚠️  WARNING: Email relay might be disabled');
            }
        } else {
            console.log('❌ Account check failed:', response.status);
        }
    } catch (error) {
        console.log('❌ Account check error:', error.message);
    }
}

async function main() {
    await checkBrevoAccount();
    await sendTargetedTest();

    console.log('\n📱 NEXT STEPS:');
    console.log('1. Check your email inbox and spam folder');
    console.log('2. If no email arrived, try a different email address');
    console.log('3. Check Brevo dashboard for sending logs');
    console.log('4. Let me know what you find!');
}

// Ensure fetch is available
if (typeof fetch === 'undefined') {
    global.fetch = require('node-fetch');
}

main();