const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const { protect } = require('../middleware/authMiddleware');
const { parseNaturalLanguage } = require('../services/aiService');

// @desc    Get all income records
// @route   GET /api/income
// @access  Private
router.get('/', protect, async (req, res) => {
  const financialYear = req.query.year || req.user.currentFinancialYear;
  try {
    const incomes = await Income.find({ user: req.user._id, financialYear }).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add income record
// @route   POST /api/income
// @access  Private
router.post('/', protect, async (req, res) => {
  const { source, amount, date, description, financialYear } = req.body;

  try {
    const income = new Income({
      user: req.user._id,
      source,
      amount,
      date,
      description,
      financialYear: financialYear || req.user.currentFinancialYear,
    });

    const createdIncome = await income.save();
    res.status(201).json(createdIncome);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add income via Natural Language
// @route   POST /api/income/ai
// @access  Private
router.post('/ai', protect, async (req, res) => {
    const { text, financialYear } = req.body;
    try {
        const parsed = await parseNaturalLanguage(text);
        if (!parsed || parsed.type !== 'income') {
            return res.status(400).json({ message: 'Could not parse income from text or text describes an expense.' });
        }

        const income = new Income({
            user: req.user._id,
            source: parsed.source || 'Unknown Source',
            amount: parsed.amount,
            date: parsed.date || new Date(),
            description: parsed.description || text,
            financialYear: financialYear || req.user.currentFinancialYear,
        });

        const createdIncome = await income.save();
        res.status(201).json(createdIncome);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete income record
// @route   DELETE /api/income/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (income) {
      if (income.user.toString() !== req.user._id.toString()) {
         return res.status(401).json({ message: 'Not authorized' });
      }
      await income.deleteOne();
      res.json({ message: 'Income removed' });
    } else {
      res.status(404).json({ message: 'Income not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
