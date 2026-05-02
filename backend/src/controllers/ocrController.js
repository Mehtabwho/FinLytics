const Tesseract = require('tesseract.js');
const fs = require('fs-extra');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

const scanDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  let extractedText = '';

  try {
    if (req.file.mimetype === 'application/pdf') {
      await fs.remove(filePath);
      return res.status(400).json({ message: 'Only JPG, JPEG, and PNG supported.' });
    }

    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    extractedText = text;

    if (!extractedText.trim()) {
      await fs.remove(filePath);
      return res.status(400).json({ message: 'Could not read document. Please upload a clearer image.' });
    }

    const preview = parseExtractedText(extractedText);
    
    // Clean up temporary file
    await fs.remove(filePath);

    res.json(preview);
  } catch (error) {
    console.error('OCR Error:', error);
    if (filePath) await fs.remove(filePath);
    res.status(500).json({ message: 'Error processing document: ' + error.message });
  }
};

const parseExtractedText = (text) => {
  const lowerText = text.toLowerCase();
  let type = 'expense';
  let category = 'Others';
  let source = '';
  let amount = 0;
  let date = new Date().toISOString().split('T')[0];
  let notes = 'Auto-generated from document scan';
  let confidence = 'low';
  let sourceLine = '';

  // Income Detection
  const incomeKeywords = ['salary', 'payroll', 'basic pay', 'gross salary', 'net pay'];
  if (incomeKeywords.some(keyword => lowerText.includes(keyword))) {
    type = 'income';
    category = 'Salary';
    source = 'Employer'; 
  }

  // Expense Detection
  const expenseKeywords = ['receipt', 'invoice', 'cash memo', 'paid', 'total', 'vat', 'subtotal'];
  if (expenseKeywords.some(keyword => lowerText.includes(keyword)) && type !== 'income') {
    type = 'expense';
  }

  // Amount Extraction
  if (type === 'income') {
    // Salary Slip amount detection (keep as is)
    const amountRegex = /(?:total|amount|payable|net pay|gross salary|paid|sum|balance)\D*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i;
    const amountMatch = text.match(amountRegex);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      confidence = 'high';
    }
  } else {
    // NEW ROBUST EXPENSE EXTRACTION LOGIC
    const result = extractExpenseAmount(text);
    amount = result.amount;
    confidence = result.confidence;
    sourceLine = result.source_line;
  }

  // Date Extraction
  const dateRegex = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\d{4}[/-]\d{1,2}[/-]\d{1,2})/;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    const rawDate = dateMatch[0].replace(/-/g, '/');
    const parts = rawDate.split('/');
    if (parts[0].length === 4) { // YYYY/MM/DD
      date = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } else if (parts[2].length === 4) { // DD/MM/YYYY
      date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  // Source/Vendor Extraction
  if (type === 'income') {
    const employerRegex = /(?:employer|company|organization|firm)\D*?:\D*?([^\n]+)/i;
    const employerMatch = text.match(employerRegex);
    if (employerMatch) source = employerMatch[1].trim();
  } else {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    if (lines.length > 0) source = lines[0];
  }

  return {
    type,
    category,
    source,
    amount,
    date,
    notes,
    confidenceLow: confidence === 'low',
    confidence,
    sourceLine,
    rawText: text
  };
};

/**
 * Production-ready Expense Amount Extraction Logic with Context Awareness
 */
const extractExpenseAmount = (rawText) => {
  const lines = rawText.split('\n');
  
  const priorityKeywords = ['grand total', 'final total', 'net total', 'amount due', 'payable', 'total paid', 'balance due', 'total', 'net bill'];
  const fallbackKeywords = ['subtotal', 'tax', 'vat', 'service charge'];
  
  // Strict ignore keywords for address/header context
  const ignoreContextKeywords = [
    'street', 'road', 'city', 'state', 'zip', 'postal', 'address', 'phone', 'contact', 
    'mobile', 'email', 'website', 'invoice no', 'receipt id', 'order id', 'date', 'time',
    'st.', 'ave.', 'blvd.', 'ar ', 'ca ', 'ny ', 'tx ', 'fl ' // Common state/address markers
  ];

  const cleanLine = (line) => {
    return line
      .replace(/([a-z])O([a-z])/gi, '$10$2')
      .replace(/(\d)O/g, '$10')
      .replace(/O(\d)/g, '0$1')
      .replace(/S(?=\d)/g, '5')
      .replace(/B(?=\d)/g, '8')
      .replace(/l(?=\d)/g, '1')
      .toLowerCase()
      .trim();
  };

  const isAddressOrContact = (line) => {
    const lower = line.toLowerCase();
    
    // Check for ignore keywords
    if (ignoreContextKeywords.some(kw => lower.includes(kw))) return true;

    // Check for common address patterns (e.g., Camden, AR 71701)
    if (/, [A-Z]{2} \d{5}/.test(line)) return true; // State + Zip code pattern
    
    // Check for standalone zip codes (exactly 5 digits)
    if (/\b\d{5}\b/.test(lower) && lower.length < 20) return true;

    // Check for phone numbers
    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(lower)) return true;
    if (/\b\d{10,11}\b/.test(lower)) return true;

    // Check for websites/emails
    if (/www\.|http|@/.test(lower)) return true;

    return false;
  };

  const extractNumber = (line) => {
    // Specifically look for numbers that look like currency (with decimals or 2+ digits)
    const match = line.match(/(\d[\d\s,.]*\d|\d)/g);
    if (!match) return null;
    
    // Pick the last number on the line (standard for receipts)
    const lastNumStr = match[match.length - 1];
    const cleaned = lastNumStr.replace(/[, \s]/g, '');
    
    // Validation: 
    // 1. Reject if exactly 5 digits (likely zip code)
    if (cleaned.length === 5) return null;
    // 2. Reject if too long (likely ID or phone)
    if (cleaned.length > 8) return null;
    
    const val = parseFloat(cleaned);
    if (isNaN(val) || val <= 0) return null;
    
    return val;
  };

  let totalsFound = [];
  let subtotal = 0;
  let tax = 0;

  // --- PHASE 1: SEARCH PRIORITY LINES ---
  for (const line of lines) {
    const cleaned = cleanLine(line);
    
    // Skip address/contact lines entirely for total extraction
    if (isAddressOrContact(line)) continue;

    for (const kw of priorityKeywords) {
      if (cleaned.includes(kw)) {
        const parts = cleaned.split(kw);
        const val = extractNumber(parts[parts.length - 1]) || extractNumber(cleaned);
        if (val) {
          totalsFound.push({ amount: val, line: line.trim() });
        }
      }
    }
  }

  // If priority totals found, return the LAST one (final payable)
  if (totalsFound.length > 0) {
    const finalMatch = totalsFound[totalsFound.length - 1];
    return {
      amount: finalMatch.amount,
      confidence: 'high',
      source_line: finalMatch.line
    };
  }

  // --- PHASE 2: FALLBACK TO SUB-CALCULATION ---
  for (const line of lines) {
    const cleaned = cleanLine(line);
    if (isAddressOrContact(line)) continue;

    if (cleaned.includes('subtotal')) {
      subtotal = extractNumber(cleaned.split('subtotal')[1]) || extractNumber(cleaned) || 0;
    }
    if (fallbackKeywords.slice(1).some(kw => cleaned.includes(kw))) {
      const val = extractNumber(cleaned) || 0;
      tax += val;
    }
  }

  if (subtotal > 0) {
    return {
      amount: subtotal + tax,
      confidence: 'medium',
      source_line: `Calculated from Subtotal (${subtotal}) + Tax (${tax})`
    };
  }

  // --- PHASE 3: LAST RESORT (SAFE NUMBERS ONLY) ---
  let maxVal = 0;
  let maxLine = '';
  for (const line of lines) {
    if (isAddressOrContact(line)) continue;
    
    const cleaned = cleanLine(line);
    const val = extractNumber(cleaned);
    
    // Only accept numbers that look like valid expenses and aren't noise
    if (val && val > maxVal && val < 500000 && !/^\d{5}$/.test(val.toString())) { 
      maxVal = val;
      maxLine = line;
    }
  }

  if (maxVal > 0) {
    return {
      amount: maxVal,
      confidence: 'low',
      source_line: maxLine.trim()
    };
  }

  return { amount: 0, confidence: 'low', source_line: '' };
};

const saveEntry = async (req, res) => {
  const { type, category, source, amount, date, notes } = req.body;

  try {
    if (type === 'income') {
      const income = new Income({
        user: req.user._id,
        source: source || 'OCR Upload',
        amount,
        date,
        description: notes
      });
      await income.save();
    } else {
      const expense = new Expense({
        user: req.user._id,
        category: category || 'Others',
        amount,
        date,
        description: notes,
        isDeductible: true // Default to true
      });
      await expense.save();
    }

    res.status(201).json({ message: 'Transaction saved successfully' });
  } catch (error) {
    console.error('Save Entry Error:', error);
    res.status(500).json({ message: 'Error saving transaction: ' + error.message });
  }
};

module.exports = {
  scanDocument,
  saveEntry
};
