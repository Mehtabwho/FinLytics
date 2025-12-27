const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error('OPENROUTER_API_KEY not set in .env');
  process.exit(1);
}

(async () => {
  const fetchImpl = globalThis.fetch || (await import('node-fetch')).default;
  const url = 'https://openrouter.ai/api/v1/models';

  try {
    console.log('Requesting OpenRouter models:', url);
    const res = await fetchImpl(url, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', res.status);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('Body (json):', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Body (text):', text.slice(0, 2000));
    }
  } catch (err) {
    console.error('OpenRouter models request failed:', err.message);
    process.exit(1);
  }
})();
