// List available Google Generative Language models using the provided API key
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('GOOGLE_API_KEY not set in .env');
  process.exit(1);
}

async function run() {
  // Try both v1 and v1beta endpoints, and both ?key= and Authorization header
  const endpoints = [
    { url: `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`, auth: 'none' },
    { url: `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`, auth: 'none' },
    { url: `https://generativelanguage.googleapis.com/v1/models`, auth: 'bearer' },
    { url: `https://generativelanguage.googleapis.com/v1beta/models`, auth: 'bearer' },
  ];

  const fetchImpl = globalThis.fetch || (await import('node-fetch')).default;

  for (const ep of endpoints) {
    try {
      console.log('Requesting', ep.url, 'auth:', ep.auth);
      const headers = { 'Content-Type': 'application/json' };
      if (ep.auth === 'bearer') headers['Authorization'] = `Bearer ${API_KEY}`;
      const res = await fetchImpl(ep.url, { headers });
      console.log('Status:', res.status);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        console.log('Body (json):', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Body (text):', text.slice(0, 2000));
      }
    } catch (err) {
      console.error('Request failed:', err.message);
    }
    console.log('---');
  }
}

run().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
