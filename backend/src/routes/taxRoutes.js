const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const UserFinancialInfo = require('../models/UserFinancialInfo');
const { calculateTax } = require('../services/taxEngine');
const { explainTax } = require('../services/aiService');
const { protect } = require('../middleware/authMiddleware');

// @desc    Calculate Tax
// @route   GET /api/tax/calculate
// @access  Private
router.get('/calculate', protect, async (req, res) => {
  const financialYear = req.query.year || req.user.currentFinancialYear;

  try {
    const incomes = await Income.find({ user: req.user._id, financialYear });
    const expenses = await Expense.find({ user: req.user._id, financialYear });

    // Fetch year-specific user info
    const userInfo = await UserFinancialInfo.findOne({ user: req.user._id, financialYear });
    const taxpayerCategory = userInfo?.taxpayerCategory || req.user.taxpayerCategory;

    const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
    const totalDeductibleExpenses = expenses
      .filter(item => item.isDeductible)
      .reduce((acc, item) => acc + item.amount, 0);

    const taxResult = calculateTax(totalIncome, totalDeductibleExpenses, taxpayerCategory, financialYear);

    res.json(taxResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get AI Explanation for Tax
// @route   POST /api/tax/explain
// @access  Private
router.post('/explain', protect, async (req, res) => {
    const { taxData } = req.body;
    const financialYear = req.query.year || req.user.currentFinancialYear;
    
    try {
        // Get financial context for better tax explanation
        const incomes = await Income.find({ user: req.user._id, financialYear });
        const expenses = await Expense.find({ user: req.user._id, financialYear });
        
        const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
        const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
        const totalTax = taxData.taxPayable || 0;
        
        const savings = Math.max(0, totalIncome - totalExpenses - totalTax);
        const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
        const taxRatio = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;
        
        const explanation = await explainTax(taxData, {
            incomes,
            expenses,
            totalIncome,
            totalExpenses,
            savingsRate: Math.round(savingsRate * 10) / 10,
            taxRatio: Math.round(taxRatio * 10) / 10,
        });
        res.json({ explanation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
