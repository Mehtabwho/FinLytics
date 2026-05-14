const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Goal = require('../models/Goal');
const { generateFinancialInsights, chatWithAI, getTaxRebateAdvisorInsights, FinancialAnalyzer } = require('../services/aiService');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get Enhanced Financial Insights with Health Score
// @route   GET /api/ai/insights
// @access  Private
router.get('/insights', protect, async (req, res) => {
    const financialYear = req.query.year || req.user.currentFinancialYear;
    
    // Get current period data
    const [currentYearIncomes, currentYearExpenses, goals] = await Promise.all([
        Income.find({ user: req.user._id, financialYear }),
        Expense.find({ user: req.user._id, financialYear }),
        Goal.find({ user: req.user._id }),
    ]);
    
    // Calculate total tax (placeholder - you would fetch this from your tax data)
    const totalTax = 0; // Replace with actual tax calculation logic
    const totalRebate = 0;
    const maxRebateCapacity = 0;
    
    try {
        const result = await generateFinancialInsights({
            incomes: currentYearIncomes,
            expenses: currentYearExpenses,
            totalTax,
            totalRebate,
            maxRebateCapacity,
            previousExpenses: [], // Add previous year data here if available
            goals,
            userProfile: {
                name: req.user.name,
                businessType: req.user.businessType,
                taxpayerCategory: req.user.taxpayerCategory
            }
        });
        
        res.json({
            insights: result.aiInsights,
            analysis: result.analysis, // This contains all the structured metrics!
        });
    } catch (error) {
        console.error('Financial Insights Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Private
router.post('/chat', protect, async (req, res) => {
    const { message, financialYear } = req.body;
    const year = financialYear || req.user.currentFinancialYear;

    try {
        // Gather some context (lightweight)
        const [incomes, expenses, goals] = await Promise.all([
            Income.find({ user: req.user._id, financialYear: year }),
            Expense.find({ user: req.user._id, financialYear: year }),
            Goal.find({ user: req.user._id }),
        ]);
        
        const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
        const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
        
        // Get deep financial analysis
        const financialAnalysis = FinancialAnalyzer.analyze({
            incomes,
            expenses,
            totalTax: 0, // Add actual tax data here
            totalRebate: 0,
            maxRebateCapacity: 0,
            previousExpenses: [],
            goals,
        });
        
        const context = {
            userProfile: {
                name: req.user.name,
                businessType: req.user.businessType,
                taxpayerCategory: req.user.taxpayerCategory
            },
            financialSummary: {
                totalIncome,
                totalExpenses
            }
        };

        const response = await chatWithAI(message, context, financialAnalysis);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/rebate-advisor', protect, async (req, res) => {
  try {
    const incomeTax = req.body.incomeTax;
    const taxYear = req.body.taxYear || req.user.currentFinancialYear;
    
    // Get financial context for personalized recommendations
    const [incomes, expenses, goals] = await Promise.all([
      Income.find({ user: req.user._id, financialYear: taxYear }),
      Expense.find({ user: req.user._id, financialYear: taxYear }),
      Goal.find({ user: req.user._id }),
    ]);
    
    const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
    const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
    const savings = Math.max(0, totalIncome - totalExpenses - (incomeTax || 0));
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    const monthlySavings = savings / 12;
    
    const financialContext = {
      totalIncome,
      totalExpenses,
      savingsRate: Math.round(savingsRate * 10) / 10,
      monthlySavings: Math.round(monthlySavings),
      emergencyFundMonths: monthlySavings > 0 ? Math.round((savings / monthlySavings) * 10) / 10 : 0,
      financialStability: savingsRate >= 20 ? 'strong' : savingsRate >= 10 ? 'moderate' : 'low',
    };
    
    const insights = await getTaxRebateAdvisorInsights({ incomeTax, taxYear, financialContext });
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
