import EmailService from './src/services/EmailService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Email Service...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);

// Test connection
console.log('\n1. Testing SMTP connection...');
const connected = await EmailService.testConnection();

if (connected) {
  console.log('✅ SMTP connection successful!\n');
  
  // Test sending email
  console.log('2. Sending test email...');
  const result = await EmailService.sendPledgeNotification({
    recipientEmail: process.env.EMAIL_USER, // Send to yourself for testing
    recipientName: 'Test User',
    donorName: 'John Doe',
    amount: 100,
    projectTitle: 'Test Project',
    donorMessage: 'This is a test message from the notification system!',
  });
  
  if (result.success) {
    console.log('✅ Test email sent successfully!');
    console.log('Check your inbox:', process.env.EMAIL_USER);
  } else {
    console.log('❌ Failed to send test email:', result.error);
  }
} else {
  console.log('❌ SMTP connection failed!');
  console.log('\n📝 Steps to fix:');
  console.log('1. Go to: https://myaccount.google.com/apppasswords');
  console.log('2. Create an App Password for "Mail"');
  console.log('3. Copy the 16-character password (remove spaces)');
  console.log('4. Update EMAIL_PASSWORD in your .env file');
  console.log('5. Restart the server and try again');
}
