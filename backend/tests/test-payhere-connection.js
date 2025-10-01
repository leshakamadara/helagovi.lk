import axios from 'axios';

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_PATH = '/api/payments/verify-connection';

async function testPayHereConnection() {
  try {
    console.log(`Testing PayHere connection via ${BASE_URL}${API_PATH}...`);
    const response = await axios.get(`${BASE_URL}${API_PATH}`);
    
    console.log('=== CONNECTION TEST RESULTS ===');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.status === 'success') {
      console.log('✅ PayHere connection is working properly');
    } else {
      console.log('⚠️ PayHere connection verification returned unexpected result');
    }
    
  } catch (error) {
    console.error('❌ PayHere connection test failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    
    console.log('\n=== TROUBLESHOOTING TIPS ===');
    console.log('1. Check if your backend server is running');
    console.log('2. Verify your PayHere credentials in environment variables');
    console.log('3. Ensure your domains are whitelisted in PayHere merchant dashboard');
    console.log('4. Check network connectivity to PayHere API servers');
  }
}

testPayHereConnection();