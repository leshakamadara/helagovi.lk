import fetch from 'node-fetch';

async function testEmails() {
  const baseUrl = 'http://localhost:5001/api/email/test';

  try {
    console.log('Testing Order Placed Email...');
    const placedResponse = await fetch(`${baseUrl}/order-placed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'thejanromal@gmail.com' }),
    });

    const placedResult = await placedResponse.json();
    console.log('Order Placed Email Result:', placedResult);

    // Wait a bit before sending the next email
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Testing Order Delivered Email...');
    const deliveredResponse = await fetch(`${baseUrl}/order-delivered`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'thejanromal@gmail.com' }),
    });

    const deliveredResult = await deliveredResponse.json();
    console.log('Order Delivered Email Result:', deliveredResult);

  } catch (error) {
    console.error('Error testing emails:', error);
  }
}

testEmails();