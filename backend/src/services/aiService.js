const FinancialAnalyzer = require('../utils/financialAnalyzer');
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = 'http://localhost:5173'; // Update with your site URL
const SITE_NAME = 'FinLytics';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

// Only OpenRouter is used in this deployment; Google Gemini support has been removed.

const callOpenRouter = async (messages, maxTokens = 800) => {
  try {
    console.log("AI Prompt:", JSON.stringify(messages, null, 2));
    console.log("Using Model:", OPENROUTER_MODEL);
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "max_tokens": maxTokens // Increased token limit for detailed responses
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API Error:", response.status, errorText);
        // Return null or throw a specific error that can be caught
        throw new Error(`AI Service Unavailable: ${response.statusText} (Check API Key)`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
        throw new Error("AI Service returned no content.");
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Service Error (OpenRouter):", error.message);
    // Re-throw to be handled by caller, but ensure it's a clean error
    throw error; 
  }
};

// Removed Google Gemini call helper

const generateContent = async (prompt, maxTokens = 800) => {
    try {
    const messages = [{ role: "user", content: prompt }];
    // Use OpenRouter
    if (OPENROUTER_API_KEY) {
      console.debug('generateContent: using OpenRouter', OPENROUTER_MODEL || '(default)');
      return await callOpenRouter(messages, maxTokens);
    }
    throw new Error('No AI provider configured (set OPENROUTER_API_KEY)');
    } catch (error) {
        console.error("generateContent failed:", error.message);
        return "I apologize, but I cannot process your request right now due to an AI service connection issue. Please check the system configuration.";
    }
};

const generateJSON = async (prompt, maxTokens = 1000) => {
    const messages = [{ role: "user", content: prompt + " \n\nResponse must be a valid JSON object without markdown formatting." }];
    try {
    let text;
    // Prefer OpenRouter for JSON generation
    if (OPENROUTER_API_KEY) {
      console.debug('generateJSON: using OpenRouter', OPENROUTER_MODEL || '(default)');
      text = await callOpenRouter(messages, maxTokens);
    } else {
      throw new Error('No AI provider configured (set OPENROUTER_API_KEY)');
    }
        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("JSON Generation/Parsing Error:", error.message);
        // Return a safe default based on context (impossible to know exact schema here, but returning null handles it downstream)
        return null;
    }
}

const classifyExpense = async (description) => {
  const prompt = `Analyze this expense description: "${description}". 
  Categorize it into one of: Rent, Salary, Utilities, Marketing, VAT, Inventory, Transport, Maintenance, Legal, Other.
  Determine if it is generally tax-deductible in Bangladesh for a business.
  Return JSON: { "category": "string", "isDeductible": boolean }`;
  
  // Try AI classification first
  const aiResult = await generateJSON(prompt);
  if (aiResult) return aiResult;

  // Fallback heuristic classification when AI fails
  try {
    const lower = (description || '').toLowerCase();
    let category = 'Other';
    if (/salary|payroll|wage/.test(lower)) category = 'Salary';
    else if (/rent/.test(lower)) category = 'Rent';
    else if (/transport|taxi|bus|uber|travel/.test(lower)) category = 'Transport';
    else if (/bill|electric|water|utility|utilities/.test(lower)) category = 'Utilities';
    else if (/ad\b|advert|ads|marketing|promotion/.test(lower)) category = 'Marketing';
    else if (/purchase|tools|inventory|stock|suppl|buying/.test(lower)) category = 'Inventory';
    else if (/chair|table|desk|furnitur|computer|laptop|printer|equipment/.test(lower)) category = 'Equipment';
    else if (/maintenance|repair|service/.test(lower)) category = 'Maintenance';
    else if (/legal|lawyer|court/.test(lower)) category = 'Legal';

    // Most business expenses are generally deductible; mark false for certain categories if desired
    const isDeductible = category !== 'Legal' ? true : true;
    return { category, isDeductible };
  } catch (err) {
    console.error('Fallback classifyExpense failed:', err.message);
    return null;
  }
};

const parseNaturalLanguage = async (text) => {
  const today = new Date().toISOString().split('T')[0];
  const prompt = `Parse this financial statement: "${text}".
  Identify whether the statement describes an "income" (money received) or an "expense" (money paid out).
  
  Current Date: ${today} (Use this date if no specific date is mentioned in the text)

  Rules:
  - Treat verbs like "paid", "paid to", "paid for", "gave" as expense.
  - Treat verbs like "received", "got", "earned", "invoice" (when received) as income.
  - If the text is ambiguous, prefer the most likely interpretation given the verb used (e.g., "paid salary" => expense).
  - Extract the numeric amount (strip currency symbols) as a number.
  - Extract a short description string.
  - Extract a category for expenses (e.g., Salary, Rent, Utilities, Inventory, Transport, Misc) when possible.
  - If no date is present, set date to ${today}.
    Return ONLY a valid JSON object or a JSON array (if multiple items are described) — no markdown, no explanation.
    If the text contains multiple expenses/incomes (for example comma-separated or joined by "and"), return a JSON array of objects, one per item.
    Example responses:
    For single: "paid salary 20000": {"type":"expense","amount":20000,"category":"Salary","description":"paid salary","date":"${today}"}
    For multiple: "salary 2000, bill 1500, transportation 1000": [
      {"type":"expense","amount":2000,"category":"Salary","description":"salary 2000","date":"${today}"},
      {"type":"expense","amount":1500,"category":"Utilities","description":"bill 1500","date":"${today}"},
      {"type":"expense","amount":1000,"category":"Transport","description":"transportation 1000","date":"${today}"}
    ]
    Always follow the schema exactly:
    { "type": "income" | "expense", "amount": number, "source": "string (if income)", "category": "string (if expense)", "description": "string", "date": "YYYY-MM-DD" }
  `;
    // First try AI-generated JSON
    const aiResult = await generateJSON(prompt);
    if (aiResult) return aiResult;

    // Fallback: basic heuristic parsing when AI fails to return valid JSON
    try {
      const lower = text.toLowerCase();
      // Split possible multiple items by commas, newlines, or ' and '
      const parts = text.split(/,|\band\b|\n/).map(p => p.trim()).filter(Boolean);
      const expenseKeywords = /\b(paid|paid to|paid for|spent|gave|purchase|purchased)\b/i;
      const incomeKeywords = /\b(received|got|earned|invoice from|paid by|income|revenue)\b/i;
      const today = new Date();
      const isoDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

      const parsedItems = parts.map(part => {
        const amountMatch = part.match(/([0-9]{1,3}(?:[0-9,]*)(?:\.[0-9]+)?)/);
        const amount = amountMatch ? Number(amountMatch[0].replace(/,/g, '')) : 0;
        const pLower = part.toLowerCase();
        let type = 'expense';
        if (incomeKeywords.test(pLower) && !expenseKeywords.test(pLower)) type = 'income';

          // Simple category guesses based on keywords (expanded)
          let category = undefined;
          if (/salary|payroll|wage/.test(pLower)) category = 'Salary';
          else if (/rent/.test(pLower)) category = 'Rent';
          else if (/transport|taxi|bus|uber|travel/.test(pLower)) category = 'Transport';
          else if (/bill|electric|water|utility|utilities/.test(pLower)) category = 'Utilities';
          else if (/ad\b|advert|ads|marketing|promotion/.test(pLower)) category = 'Marketing';
          else if (/chair|table|desk|furnitur|computer|laptop|printer|equipment|buying/.test(pLower)) category = 'Equipment';
          else if (/purchase|tools|inventory|stock|suppl/.test(pLower)) category = 'Inventory';
          else category = 'Uncategorized';

        return {
          type,
          amount,
          source: type === 'income' ? part : undefined,
          category: type === 'expense' ? category : undefined,
          description: part,
          date: isoDate
        };
      });

      return parsedItems.length > 1 ? parsedItems : parsedItems[0];
    } catch (err) {
      console.error('Fallback parsing failed:', err.message);
      return null;
    }
}

const explainTax = async (taxData, financialData = {}) => {
    const prompt = `You are FinLytics AI, a tax advisor for Bangladeshi taxpayers.

TAX CALCULATION DATA:
${JSON.stringify(taxData, null, 2)}

${financialData.incomes ? `FINANCIAL CONTEXT:
- Total Income: ৳${financialData.totalIncome?.toLocaleString() || 'N/A'}
- Total Expenses: ৳${financialData.totalExpenses?.toLocaleString() || 'N/A'}
- Savings Rate: ${financialData.savingsRate || 'N/A'}%
- Tax Ratio: ${financialData.taxRatio || 'N/A'}%
` : ''}

GENERATE A PROFESSIONAL, STRUCTURED EXPLANATION:
1. TAX CALCULATION OVERVIEW (1-2 sentences)
2. TAX-FREE THRESHOLD EXPLANATION
3. WHY TAX IS THIS AMOUNT (reference specific numbers)
4. TAX EFFICIENCY OBSERVATIONS
5. NBR-COMPLIANT TAX-SAVING SUGGESTIONS (3-4 specific items)
6. NEXT STEPS

Disclaimer: This is advisory guidance, not legal tax advice. Consult a tax professional.`;
    return await generateContent(prompt);
};

const getInvestmentInsights = async (financialData) => {
    const prompt = `Analyze this financial summary:
    ${JSON.stringify(financialData)}
    
    Suggest:
    1. Reinvestment options.
    2. Expense optimization.
    3. Emergency reserve planning.
    
    Disclaimer: This is not financial advice.`;
    
    return await generateContent(prompt);
}

const chatWithAI = async (message, context, financialAnalysis = null) => {
    let prompt = `You are FinLytics AI, an intelligent, context-aware financial co-pilot for Bangladeshi taxpayers and SME owners.

USER PROFILE:
- Name: ${context.userProfile?.name || 'User'}
- Business Type: ${context.userProfile?.businessType || 'Not specified'}
- Taxpayer Category: ${context.userProfile?.taxpayerCategory || 'General'}

FINANCIAL SUMMARY (IF AVAILABLE):
- Total Income: ৳${context.financialSummary?.totalIncome?.toLocaleString() || 'N/A'}
- Total Expenses: ৳${context.financialSummary?.totalExpenses?.toLocaleString() || 'N/A'}
${financialAnalysis ? `
DEEP FINANCIAL INSIGHTS:
- Financial Health Score: ${financialAnalysis.financialHealthScore}/100 (${financialAnalysis.healthStatus})
- Savings Rate: ${financialAnalysis.metrics.savingsRate}%
- Emergency Fund: ${financialAnalysis.metrics.emergencyFundMonths} months
- Top Expense Category: ${financialAnalysis.metrics.topExpenseCategory.name}
` : ''}

IMPORTANT RULES FOR YOU:
- Always be professional, analytical, and encouraging
- Reference specific user data when answering questions
- Never calculate taxes or financial metrics - all calculations are done by the system
- Provide personalized, actionable advice tailored to their situation
- Use Bangladeshi context (BDT, NBR rules, local investment options)
- If you don't know the answer, guide them to use the system's features
- Keep responses concise but comprehensive

USER MESSAGE: ${message}

Answer the user's question based on the context provided.`;
    
    return await generateContent(prompt);
}

const getTaxRebateAdvisorInsights = async ({ incomeTax, taxYear, financialContext = {} }) => {
  // Fallback data if AI fails
  const fallbackData = {
    summary: "Based on your income tax profile, you have several tax rebate opportunities through NBR-approved investments. Consider these options to optimize your tax liability.",
    suggestions: [
      {
        option: "Government Pension Fund",
        suggestedAmount: 50000,
        estimatedRebateEfficiency: "High",
        riskLevel: "Low risk",
        liquidityLevel: "Low",
        suitableBecause: ["Stable long-term investment", "NBR-approved for tax rebate", "Builds retirement reserve"],
        expectedImpact: ["Reduces taxable income", "Provides retirement security", "Low risk investment"],
        recommendationConfidence: "High"
      },
      {
        option: "DPS (Deposit Pension Scheme)",
        suggestedAmount: 30000,
        estimatedRebateEfficiency: "High",
        riskLevel: "Low risk",
        liquidityLevel: "Medium",
        suitableBecause: ["Monthly savings plan", "Good for disciplined savings", "Tax-efficient"],
        expectedImpact: ["Regular savings habit", "Tax rebate benefits", "Medium liquidity"],
        recommendationConfidence: "High"
      },
      {
        option: "Sanchaypatra",
        suggestedAmount: 25000,
        estimatedRebateEfficiency: "Medium",
        riskLevel: "Low risk",
        liquidityLevel: "Medium",
        suitableBecause: ["Government-backed security", "Stable returns", "Easy to invest"],
        expectedImpact: ["Safe investment option", "Tax rebate eligibility", "Stable returns"],
        recommendationConfidence: "Medium"
      }
    ],
    disclaimer: "This is advisory guidance only. Consult a qualified tax professional before making investment decisions."
  };

  if (!OPENROUTER_API_KEY) {
    console.log('AI Service unavailable, using fallback data');
    return fallbackData;
  }
  
  try {
    // SIMPLE, RELIABLE JSON PROMPT
    const prompt = `You are FinLytics Tax Rebate Advisor.

USER DATA:
- Income Tax: ৳${incomeTax?.toLocaleString() || '0'}
- Savings Rate: ${financialContext.savingsRate || 0}%
- Monthly Savings: ৳${financialContext.monthlySavings?.toLocaleString() || '0'}

RESPOND WITH VALID JSON ONLY:
{
  "summary": "Brief summary of tax rebate opportunities",
  "suggestions": [
    {
      "option": "Investment option name",
      "suggestedAmount": 50000,
      "estimatedRebateEfficiency": "High",
      "riskLevel": "Low risk",
      "liquidityLevel": "Medium",
      "suitableBecause": ["Matches your savings", "Good for tax savings"],
      "expectedImpact": ["Reduces taxable income", "Builds reserve"],
      "recommendationConfidence": "High"
    }
  ],
  "disclaimer": "Advisory guidance only. Consult a tax professional."
}

Generate 3 simple recommendations.`;
    
    const result = await generateJSON(prompt, 1000);
    if (!result || !result.summary || !Array.isArray(result.suggestions)) {
      console.log('AI response invalid, using fallback data');
      return fallbackData;
    }
    return result;
  } catch (error) {
    console.error('Tax Rebate Advisor AI failed, using fallback:', error);
    return fallbackData;
  }
}

const generateGoalInsights = async (goal, incomeData, expenseData) => {
  const prompt = `Analyze this financial goal and the user's current financial situation:
  Goal: ${JSON.stringify(goal)}
  Total Income: ${incomeData.reduce((sum, inc) => sum + inc.amount, 0)}
  Total Expenses: ${expenseData.reduce((sum, exp) => sum + exp.amount, 0)}
  Recent Transactions: ${JSON.stringify([...incomeData, ...expenseData].slice(-5))}

  Please provide:
  1. Monthly savings needed to reach the goal within a reasonable timeframe.
  2. Estimated time (in months) to achieve the goal based on current net savings (Income - Expenses).
  3. 2-3 simple, actionable suggestions to achieve this goal faster.

  Return the response in a friendly, encouraging tone. Focus on the BDT currency context if applicable.
  Keep it short (max 150 words).`;

  return await generateContent(prompt);
};

/**
 * Generate AI-powered financial insights using structured analysis from FinancialAnalyzer
 * @param {Object} params - Analysis parameters
 * @returns {Object} AI insights and recommendations
 */
const generateFinancialInsights = async ({ 
  incomes = [], 
  expenses = [], 
  totalTax = 0, 
  totalRebate = 0,
  maxRebateCapacity = 0,
  previousExpenses = [],
  goals = [],
  userProfile = {}
}) => {
  // Step 1: Get deterministic financial analysis
  const analysis = FinancialAnalyzer.analyze({
    incomes,
    expenses,
    totalTax,
    totalRebate,
    maxRebateCapacity,
    previousExpenses,
    goals,
  });

  // Fallback AI insights if AI fails
  const fallbackInsights = `Financial Health Overview:
Your financial health is ${analysis.healthStatus} with a score of ${analysis.financialHealthScore}/100. You have a savings rate of ${analysis.metrics.savingsRate}% and your top expense is ${analysis.metrics.topExpenseCategory.name}.

Key Observations:
• Total Income: ৳${analysis.metrics.totalIncome.toLocaleString()}
• Total Expenses: ৳${analysis.metrics.totalExpense.toLocaleString()}
• Net Savings: ৳${analysis.metrics.savings.toLocaleString()}
• Savings Rate: ${analysis.metrics.savingsRate}%

Recommendations:
1. Review your ${analysis.metrics.topExpenseCategory.name} expenses to identify potential savings
2. Aim to maintain a savings rate of at least 20% for long-term financial stability
3. Consider tax-efficient investment options to optimize your tax liability

Disclaimer: This is advisory guidance, not financial advice. Consult a qualified professional.`;

  try {
    // Step 2: Prepare SIMPLE, concise prompt for better reliability
    const prompt = `You are FinLytics AI, a financial advisor for Bangladeshi users.

FINANCIAL DATA:
- Total Income: ৳${analysis.metrics.totalIncome.toLocaleString()}
- Total Expenses: ৳${analysis.metrics.totalExpense.toLocaleString()}
- Net Savings: ৳${analysis.metrics.savings.toLocaleString()}
- Savings Rate: ${analysis.metrics.savingsRate}%
- Expense Ratio: ${analysis.metrics.expenseRatio}%
- Financial Health Score: ${analysis.financialHealthScore}/100 (${analysis.healthStatus})
- Top Expense: ${analysis.metrics.topExpenseCategory.name} (৳${analysis.metrics.topExpenseCategory.amount.toLocaleString()})

RULES:
- Use professional, concise language
- Reference specific numbers
- Give 3-4 actionable recommendations
- Keep under 500 words
- Use Bangladeshi context
- Disclaimer: Advisory guidance only`;

    const aiResponse = await generateContent(prompt, 800);

    // Return both the structured analysis and AI-generated insights
    return {
      analysis, // Deterministic metrics
      aiInsights: aiResponse || fallbackInsights, // AI-generated explanation or fallback
    };
  } catch (error) {
    console.error('AI generation failed, using fallback:', error);
    // Return fallback insights if AI fails
    return {
      analysis,
      aiInsights: fallbackInsights,
    };
  }
};

module.exports = {
  generateContent,
  generateJSON,
  classifyExpense,
  parseNaturalLanguage,
  explainTax,
  getInvestmentInsights,
  chatWithAI,
  getTaxRebateAdvisorInsights,
  generateGoalInsights,
  generateFinancialInsights,
  FinancialAnalyzer, // Export for direct use in controllers
};
