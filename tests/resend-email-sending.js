// tests/resend-own-email-test.js - Test with your own email
require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function testResendOwnEmail() {
    console.log('📧 Testing Resend with Your Own Email...\n');
    
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY not found in .env.local');
        return;
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    try {
        console.log('📤 Sending test email to your registered email...');
        
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Resend's verified domain
            to: ['vermarohit3875@gmail.com'], // Your registered email
            subject: '🎉 Resend Works! Time to Add Domain - Nudgr',
            html: `
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #10b981; color: white; padding: 30px; border-radius: 10px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">🎉 Resend Integration Success!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 18px;">Your Nudgr app is connected to Resend</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #fef3c7; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <h2 style="color: #92400e; margin-top: 0;">⚠️ Important: Domain Required</h2>
                        <p style="color: #92400e; margin: 0;">
                            <strong>Current Status:</strong> You can only send test emails to rohitcodes03@gmail.com
                        </p>
                        <p style="color: #92400e;">
                            <strong>To send to clients:</strong> You need to verify a custom domain
                        </p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f0f9ff; border-radius: 10px; margin: 20px 0;">
                        <h2 style="color: #1e40af; margin-top: 0;">🌐 Domain Setup Options</h2>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 2px solid #3b82f6;">
                            <h3 style="color: #1e40af; margin-top: 0;">Option 1: Quick Setup (Recommended)</h3>
                            <ul style="color: #374151;">
                                <li><strong>Buy:</strong> nudgr.dev or yournamehere.com ($12/year)</li>
                                <li><strong>Add to Resend:</strong> Takes 5 minutes</li>
                                <li><strong>Use:</strong> noreply@yourdomain.com</li>
                                <li><strong>Result:</strong> Professional emails immediately</li>
                            </ul>
                        </div>
                        
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <h4 style="color: #374151; margin-top: 0;">Option 2: Free Subdomain</h4>
                            <p style="color: #6b7280; margin: 0;">
                                Some providers offer free subdomains (like yourapp.vercel.app) 
                                but custom domains look more professional.
                            </p>
                        </div>
                    </div>
                    
                    <div style="padding: 20px; background-color: #ecfdf5; border-radius: 10px; border-left: 4px solid #10b981;">
                        <h3 style="color: #065f46; margin-top: 0;">✅ What Works Now</h3>
                        <ul style="color: #065f46;">
                            <li>✅ Resend API connection established</li>
                            <li>✅ Email sending infrastructure ready</li>
                            <li>✅ Your app code is correct</li>
                            <li>✅ 3,000 free emails per month</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
                        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
                        <p>This confirms Resend integration is working - now just need a domain!</p>
                    </div>
                </body>
                </html>
            `,
        });
        
        if (error) {
            console.error('❌ Resend Error:', error);
            return false;
        }
        
        console.log('✅ EMAIL SENT TO YOUR EMAIL!');
        console.log('📨 Email ID:', data.id);
        console.log('📧 Check: rohitcodes03@gmail.com');
        console.log('📍 Should arrive within 30 seconds');
        
        return true;
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return false;
    }
}

async function showDomainOptions() {
    console.log('\n🌐 DOMAIN SETUP GUIDE:\n');
    
    console.log('📋 Popular Domain Registrars:');
    console.log('• Namecheap.com - Usually cheapest');
    console.log('• GoDaddy.com - Most popular');  
    console.log('• Cloudflare.com - Best for developers');
    console.log('• Porkbun.com - Good prices, simple interface');
    
    console.log('\n💡 Recommended Domains for Nudgr:');
    console.log('• nudgr.dev - Perfect for your app ($12-15/year)');
    console.log('• nudgr.com - Classic choice ($12-15/year)');
    console.log('• yournamehere.dev - Personal branding');
    console.log('• yournamehere.com - Professional');
    
    console.log('\n⚡ Quick Setup Process:');
    console.log('1. Buy domain (5 minutes)');
    console.log('2. Go to resend.com/domains');
    console.log('3. Add your domain');
    console.log('4. Copy DNS records to your domain registrar');
    console.log('5. Wait for verification (usually instant)');
    console.log('6. Update RESEND_FROM_EMAIL=noreply@yourdomain.com');
    console.log('7. Send emails to anyone! 🚀');
    
    console.log('\n🎯 After Domain Setup:');
    console.log('• Send invoice reminders to any email');
    console.log('• Professional sender address');
    console.log('• Better email deliverability');
    console.log('• No more "testing only" restrictions');
}

async function main() {
    const success = await testResendOwnEmail();
    
    if (success) {
        console.log('\n🎉 RESEND INTEGRATION CONFIRMED!');
        await showDomainOptions();
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Check rohitcodes03@gmail.com for the test email');
        console.log('2. Buy a domain (recommended: nudgr.dev)');
        console.log('3. Set up domain in Resend dashboard');
        console.log('4. Update your .env.local');
        console.log('5. Start sending invoice reminders! 📧');
        
    } else {
        console.log('\n❌ Something went wrong - check your API key');
    }
}

main();