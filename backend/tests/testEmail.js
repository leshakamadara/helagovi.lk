import { sendTicketConfirmationEmail } from '../src/utils/email.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test email functionality
const testEmail = async () => {
  try {
    console.log('Testing email functionality...');
    console.log('📧 Email Host:', process.env.EMAIL_HOST);
    console.log('📧 Email Port:', process.env.EMAIL_PORT);
    console.log('📧 Email User:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('📧 Email Pass:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    console.log('🌐 Client URL:', process.env.CLIENT_URL);

    // Mock ticket data
    const mockTicketData = {
      _id: '507f1f77bcf86cd799439011',
      ticketNumber: 'TICK-TEST-001',
      title: 'Test Email - Support Ticket Confirmation',
      category: 'Technical Support',
      priority: 'High',
      status: 'Open',
      createdAt: new Date()
    };

    const testUserEmail = 'leshakamadara@gmail.com';
    const testUserName = 'Leshaka Madara';

    console.log(`\n📤 Sending test email to: ${testUserEmail}`);
    console.log(`👤 User Name: ${testUserName}`);
    console.log(`🎫 Ticket: ${mockTicketData.title} (${mockTicketData.ticketNumber})`);

    // Send actual test email
    await sendTicketConfirmationEmail(testUserEmail, mockTicketData, testUserName);

    console.log('\n✅ Test email sent successfully!');
    console.log('📧 Check your inbox at:', testUserEmail);
    console.log('📝 Subject: Ticket Created -', mockTicketData.title);
    console.log('🎫 Ticket Number:', mockTicketData.ticketNumber);
    console.log('\n💡 If you don\'t see the email, check your spam folder.');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n� Troubleshooting:');
    console.log('1. Verify Gmail credentials in .env file');
    console.log('2. Ensure 2FA is enabled on Gmail account');
    console.log('3. Check that App Password is correct');
    console.log('4. Verify EMAIL_HOST, EMAIL_PORT settings');
  }
};

// Run the test
testEmail();