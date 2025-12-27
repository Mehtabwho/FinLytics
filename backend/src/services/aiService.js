const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = 'http://localhost:5173'; // Update with your site URL
const SITE_NAME = 'FinLytics';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free';

// Only OpenRouter is used in this deployment; Google Gemini support has been removed.

const callOpenRouter = async (messages) => {
  try {
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
        "messages": messages
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

const generateContent = async (prompt) => {
    try {
    const messages = [{ role: "user", content: prompt }];
    // Use OpenRouter
    if (OPENROUTER_API_KEY) {
      console.debug('generateContent: using OpenRouter', OPENROUTER_MODEL || '(default)');
      return await callOpenRouter(messages);
    }
    throw new Error('No AI provider configured (set OPENROUTER_API_KEY)');
    } catch (error) {
        console.error("generateContent failed:", error.message);
        return "I apologize, but I cannot process your request right now due to an AI service connection issue. Please check the system configuration.";
    }
};

const generateJSON = async (prompt) => {
    const messages = [{ role: "user", content: prompt + " \n\nResponse must be a valid JSON object without markdown formatting." }];
    try {
    let text;
    // Prefer OpenRouter for JSON generation
    if (OPENROUTER_API_KEY) {
      console.debug('generateJSON: using OpenRouter', OPENROUTER_MODEL || '(default)');
      text = await callOpenRouter(messages);
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
  
  return await generateJSON(prompt);
};

const parseNaturalLanguage = async (text) => {
    const prompt = `Parse this financial statement: "${text}".
    Identify if it is an income or expense.
    Extract amount, source (for income) or category (for expense), and date (default to today if not specified).
    Return JSON: { 
        "type": "income" | "expense", 
        "amount": number, 
        "source": "string (if income)", 
        "category": "string (if expense)",
        "description": "string", 
        "date": "YYYY-MM-DD" 
    }`;
    return await generateJSON(prompt);
}

const explainTax = async (taxData) => {
    const prompt = `Explain this tax calculation for a Bangladeshi SME owner in simple language:
    ${JSON.stringify(taxData)}
    
    Explain:
    1. The tax-free threshold applied.
    2. Why tax increased or is zero.
    3. Any missing data warnings.
    4. Legal tax-saving suggestions (advisory).
    
    Keep it professional and helpful.`;
    
    return await generateContent(prompt);
}

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

const chatWithAI = async (message, context) => {
    const prompt = `You are FinLytics AI, a helpful assistant for Bangladeshi business owners.
    Context: ${JSON.stringify(context)}
    
    User: ${message}
    
    Answer the user's question based on the context provided. Guide them on using the system if needed.`;
    
    return await generateContent(prompt);
}

module.exports = {
  classifyExpense,
  parseNaturalLanguage,
  explainTax,
  getInvestmentInsights,
  chatWithAI
};
