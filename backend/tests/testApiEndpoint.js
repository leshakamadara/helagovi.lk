#!/usr/bin/env node

/**
 * Test the actual API endpoint that the frontend calls
 */

import http from 'http';

const testApiEndpoint = async () => {
  console.log('🧪 Testing /products API endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/products?limit=5',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ API Response received');
          
          if (response.success && response.data) {
            console.log(`📦 Found ${response.data.length} products:`);
            response.data.forEach((product, index) => {
              const rating = product.averageRating || 0;
              const reviews = product.totalReviews || 0;
              console.log(`   ${index + 1}. ${product.title}: ⭐ ${rating.toFixed(1)} (${reviews} reviews)`);
            });
          } else {
            console.log('⚠️  API response structure unexpected:', response);
          }
          
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ API request failed:', error.message);
      console.log('💡 Make sure the backend server is running on port 5001');
      reject(error);
    });

    req.end();
  });
};

// Run the test
testApiEndpoint().catch(() => {
  console.log('\n📝 To test manually:');
  console.log('1. Start backend: npm run dev (in backend folder)');
  console.log('2. Visit: http://localhost:5001/api/products?limit=5');
  console.log('3. Check if averageRating and totalReviews are in the response');
});