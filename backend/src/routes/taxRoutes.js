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
    try {
        const explanation = await explainTax(taxData);
        res.json({ explanation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
