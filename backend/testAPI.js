import axios from 'axios';

async function testProductAPI() {
  try {
    console.log('Testing products API...');
    
    const response = await axios.get('http://localhost:5001/api/products');
    const products = response.data.data;
    
    console.log(`Total products returned: ${products.length}`);
    
    // Look for our specific product
    const targetProduct = products.find(p => p._id === '68d3adc918abfb30f786d044');
    
    if (targetProduct) {
      console.log('✅ Product FOUND in marketplace!');
      console.log('- Name:', targetProduct.title);
      console.log('- Status:', targetProduct.status);
      console.log('- Category:', targetProduct.category?.name || 'No category');
      console.log('- Available Quantity:', targetProduct.availableQuantity);
    } else {
      console.log('❌ Product NOT found in marketplace');
      console.log('Products in response:');
      products.slice(0, 3).forEach(p => {
        console.log(`- ${p.title} (ID: ${p._id})`);
      });
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('Backend server is not running on localhost:5001');
    }
  }
}

testProductAPI();