// Simple test script to exercise the AI service (Google Gemini preferred when GOOGLE_API_KEY is set)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { chatWithAI, getInvestmentInsights } = require('../src/services/aiService');

async function run() {
  try {
    console.log('Running Google Gemini test...');
    const chat = await chatWithAI('Hello from test script', { test: true });
    console.log('Chat response:', chat);

    const insights = await getInvestmentInsights({ totalIncome: 100000, totalExpenses: 40000, profit: 60000 });
    console.log('Insights response:', insights);

    console.log('Test completed successfully.');
  } catch (err) {
    console.error('Test failed:', err.message);
    if (err.response) {
      try {
        console.error('Error body:', await err.response.text());
      } catch (e) { /* ignore */ }
    }
    process.exitCode = 1;
  }
}

run();
