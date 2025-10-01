// Frontend webhook proxy for PayHere notifications
// This file handles webhook forwarding from frontend to backend

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const BACKEND_URL = 'https://helagovi-lk.onrender.com';
  
  try {
    console.log('PayHere webhook received by frontend proxy:', req.body);
    
    // Forward the webhook to backend
    const response = await fetch(`${BACKEND_URL}/api/payments/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'helagovi.lk-webhook-proxy'
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.text();
    
    console.log('Backend response:', response.status, result);
    
    // Return success to PayHere
    res.status(200).json({ message: 'Webhook processed' });
    
  } catch (error) {
    console.error('Webhook proxy error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
}