const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error('OPENROUTER_API_KEY not set in .env');
  process.exit(1);
}

(async () => {
  const fetchImpl = globalThis.fetch || (await import('node-fetch')).default;
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free';
  const body = {
    model,
    messages: [{ role: 'user', content: 'Hello from OpenRouter test' }]
  };

  try {
    console.log('Sending request to OpenRouter:', url, 'model:', model);
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
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
    console.error('OpenRouter request failed:', err.message);
    process.exit(1);
  }
})();
