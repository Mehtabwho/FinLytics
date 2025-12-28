const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');
const { classifyExpense, parseNaturalLanguage } = require('../services/aiService');

// @desc    Get all expense records
// @route   GET /api/expenses
// @access  Private
router.get('/', protect, async (req, res) => {
  const financialYear = req.query.year || req.user.currentFinancialYear;
  try {
    const expenses = await Expense.find({ user: req.user._id, financialYear }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add expense record
// @route   POST /api/expenses
// @access  Private
router.post('/', protect, async (req, res) => {
  const { category, amount, date, description, isDeductible, financialYear } = req.body;

  try {
    // Optional: Auto-classify if category is missing but description exists
    let finalCategory = category;
    let finalIsDeductible = isDeductible;

    if ((!category || isDeductible === undefined) && description) {
        const classification = await classifyExpense(description);
        if (classification) {
            finalCategory = finalCategory || classification.category;
            if (finalIsDeductible === undefined) finalIsDeductible = classification.isDeductible;
        }
    }

    const expense = new Expense({
      user: req.user._id,
      category: finalCategory || 'Uncategorized',
      amount,
      date,
      description,
      isDeductible: finalIsDeductible !== undefined ? finalIsDeductible : true, // Default to true if AI fails
      financialYear: financialYear || req.user.currentFinancialYear,
    });

    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add expense via Natural Language
// @route   POST /api/expenses/ai
// @access  Private
router.post('/ai', protect, async (req, res) => {
    const { text } = req.body;
    try {
    const parsed = await parseNaturalLanguage(text);

    if (!parsed) {
      return res.status(400).json({ message: 'Could not parse expense from text or text describes income.' });
    }

    // If parser returned an array, create multiple expenses
    if (Array.isArray(parsed)) {
      const created = [];
      for (const item of parsed) {
        if (!item || item.type !== 'expense') continue; // skip incomes or invalid items

        const classification = await classifyExpense(item.description || text);

        const expense = new Expense({
          user: req.user._id,
          category: item.category || classification?.category || 'Uncategorized',
          amount: item.amount,
          date: item.date || new Date(),
          description: item.description || text,
          isDeductible: classification ? classification.isDeductible : true,
          financialYear: req.user.currentFinancialYear,
        });

        const createdExpense = await expense.save();
        created.push(createdExpense);
      }

      if (created.length === 0) {
        return res.status(400).json({ message: 'No expenses found in input.' });
      }

      return res.status(201).json(created);
    }

    // Single parsed object flow
    if (parsed.type !== 'expense') {
      return res.status(400).json({ message: 'Could not parse expense from text or text describes income.' });
    }

    // Secondary classification for deductibility
    const classification = await classifyExpense(parsed.description || text);

    const expense = new Expense({
      user: req.user._id,
      category: parsed.category || classification?.category || 'Uncategorized',
      amount: parsed.amount,
      date: parsed.date || new Date(),
      description: parsed.description || text,
      isDeductible: classification ? classification.isDeductible : true,
      financialYear: req.user.currentFinancialYear,
    });

    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete expense record
// @route   DELETE /api/expenses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (expense) {
      if (expense.user.toString() !== req.user._id.toString()) {
         return res.status(401).json({ message: 'Not authorized' });
      }
      await expense.deleteOne();
      res.json({ message: 'Expense removed' });
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
