import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'https://helagovi-lk.onrender.com';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// PayHere webhook proxy endpoints
app.post('/api/payments/notify', async (req, res) => {
  console.log('🔔 PayHere webhook received by frontend proxy');
  console.log('Webhook data:', req.body);
  
  try {
    // Forward webhook to backend
    const response = await fetch(`${BACKEND_URL}/api/payments/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'helagovi.lk-webhook-proxy/1.0'
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.text();
    console.log('✅ Backend response:', response.status, result);
    
    // Always return 200 to PayHere
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ Webhook proxy error:', error);
    res.status(200).send('OK'); // Still return 200 to PayHere
  }
});

// Charge notification webhook
app.post('/api/payments/charge-notify', async (req, res) => {
  console.log('🔔 PayHere charge webhook received by frontend proxy');
  console.log('Charge webhook data:', req.body);
  
  try {
    // Forward webhook to backend  
    const response = await fetch(`${BACKEND_URL}/api/payments/charge-notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'helagovi.lk-webhook-proxy/1.0'
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.text();
    console.log('✅ Backend response:', response.status, result);
    
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ Charge webhook proxy error:', error);
    res.status(200).send('OK');
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📡 Webhook proxy active - forwarding to ${BACKEND_URL}`);
});