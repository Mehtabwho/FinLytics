const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { chatWithAI, getInvestmentInsights } = require('../src/services/aiService');

async function run() {
  try {
    console.log('Running direct AI invocation tests...');

    console.log('\n1) chatWithAI test');
    const chat = await chatWithAI('Hello from direct test', { test: true });
    console.log('chatWithAI response:', chat);

    console.log('\n2) getInvestmentInsights test');
    const insights = await getInvestmentInsights({ totalIncome: 100000, totalExpenses: 40000, profit: 60000 });
    console.log('getInvestmentInsights response:', insights);

    console.log('\nDirect AI invocation tests completed successfully.');
  } catch (err) {
    console.error('Direct AI invocation test failed:', err.message);
    if (err.response && typeof err.response.text === 'function') {
      try { console.error('Error body:', await err.response.text()); } catch (e) { /* ignore */ }
    }
    process.exitCode = 1;
  }
}

run();
