const express = require('express');
const path = require('path');
const prerender = require('prerender-node');

const app = express();
const PORT = process.env.PORT || 10000;

// Set up prerender middleware for social media crawlers
app.use(prerender.set('prerenderToken', process.env.PRERENDER_TOKEN || ''));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});