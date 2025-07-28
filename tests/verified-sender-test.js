// verified-sender-test.js - Test with your verified email
require('dotenv').config({ path: '.env.local' });

async function testWithVerifiedSender() {
    console.log('✅ Testing with Verified Sender Email\n');
    
    const emailPayload = {
        sender: { 
            name: "Nudgr", 
            email: "rohitcodes03@gmail.com" // Your verified sender
        },
        to: [{ 
            email: "rohitdev100x@gmail.com", // Your test email
            name: "Test User" 
        }],
        subject: "✅ Verified Sender Test - " + new Date().toLocaleTimeString(),
        htmlContent: `
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                    <h2 style="color: #155724; margin-top: 0;">✅ Verified Sender Test</h2>
                    <p style="color: #155724;">
                        This email is being sent from your <strong>verified sender address</strong>: rohitcodes03@gmail.com
                    </p>
                    <p style="color: #155724;">
                        If you receive this email, it means using your verified sender address works!
                    </p>
                    <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                        <p style="margin: 0; color: #333;">
                            <strong>🕐 Sent:</strong> ${new Date().toLocaleString()}<br>
                            <strong>📧 From:</strong> rohitcodes03@gmail.com (Verified)<br>
                            <strong>📨 To:</strong> rohitdev100x@gmail.com<br>
                            <strong>🔐 Status:</strong> Using verified sender authentication
                        </p>
                    </div>
                    <p style="color: #155724; font-size: 14px;">
                        <strong>Next step:</strong> If this works, we'll update your Nudgr app to use your verified sender address for all emails.
                    </p>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        console.log('📧 Sending from verified sender:', emailPayload.sender.email);
        console.log('📧 Sending to:', emailPayload.to[0].email);
        
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
        
        if (response.ok) {
            console.log('✅ EMAIL SENT WITH VERIFIED SENDER!');
            console.log('📨 Message ID:', result.messageId);
            console.log('\n📍 CHECK YOUR EMAIL NOW:');
            console.log('   🔍 Look in inbox AND spam folder');
            console.log('   📧 Email should arrive within 1-2 minutes');
            console.log('   ✉️  Subject: "✅ Verified Sender Test"');
            console.log('\n💡 This should work much better than the default sender!');
        } else {
            console.log('❌ Send failed:', result);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testWithVerifiedSender();