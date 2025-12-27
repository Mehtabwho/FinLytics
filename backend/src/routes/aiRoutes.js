const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { getInvestmentInsights, chatWithAI } = require('../services/aiService');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get Investment Insights
// @route   GET /api/ai/insights
// @access  Private
router.get('/insights', protect, async (req, res) => {
    const financialYear = req.query.year || req.user.currentFinancialYear;
    try {
        const incomes = await Income.find({ user: req.user._id, financialYear });
        const expenses = await Expense.find({ user: req.user._id, financialYear });

        const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
        const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
        const profit = totalIncome - totalExpenses;

        const financialData = {
            financialYear,
            totalIncome,
            totalExpenses,
            profit,
            expenseBreakdown: expenses.reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
            }, {})
        };

        const insights = await getInvestmentInsights(financialData);
        res.json({ insights });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Private
router.post('/chat', protect, async (req, res) => {
    const { message } = req.body;
    const financialYear = req.user.currentFinancialYear;

    try {
        // Gather some context (lightweight)
        const incomes = await Income.find({ user: req.user._id, financialYear });
        const expenses = await Expense.find({ user: req.user._id, financialYear });
        
        const context = {
            userProfile: {
                name: req.user.name,
                businessType: req.user.businessType,
                taxpayerCategory: req.user.taxpayerCategory
            },
            financialSummary: {
                totalIncome: incomes.reduce((acc, item) => acc + item.amount, 0),
                totalExpenses: expenses.reduce((acc, item) => acc + item.amount, 0)
            }
        };

        const response = await chatWithAI(message, context);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
