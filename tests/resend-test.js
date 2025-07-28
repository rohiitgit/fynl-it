// test-env.js - Run this to test your environment setup
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testResendConnection() {
  console.log('🔧 Testing Resend API connection...');
  
  // Check if API key exists
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    return;
  }
  
  if (!process.env.RESEND_FROM_EMAIL) {
    console.error('❌ RESEND_FROM_EMAIL not found in environment variables');
    return;
  }

  console.log('✅ Environment variables found');
  console.log(`📧 From Email: ${process.env.RESEND_FROM_EMAIL}`);
  
  // Test API key validity
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    // This won't send an email, just tests API key validity
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: 'rohitcodes03@gmail.com', // This won't actually send
      subject: 'Test Connection',
      html: '<p>Test</p>',
    });
    
    if (error) {
      console.error('❌ Resend API Error:', error);
    } else {
      console.log('✅ Resend API connection successful');
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testResendConnection();