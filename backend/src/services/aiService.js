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
