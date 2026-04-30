const Goal = require('../models/Goal');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const aiService = require('../services/aiService');

// @desc    Get all goals for a user in a specific financial year
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const financialYear = req.query.year || req.query.financialYear;
    if (!financialYear) {
      return res.status(400).json({ message: 'Financial year is required' });
    }

    const goalDoc = await Goal.findOne({ user: req.user._id, financialYear });
    res.json(goalDoc ? goalDoc.goals : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add or Update a goal
// @route   POST /api/goals
// @access  Private
const upsertGoal = async (req, res) => {
  try {
    const { financialYear, goal } = req.body;
    const { id, name, targetAmount, currentAmount, category } = goal;

    let goalDoc = await Goal.findOne({ user: req.user._id, financialYear });

    if (!goalDoc) {
      goalDoc = new Goal({
        user: req.user._id,
        financialYear,
        goals: [],
      });
    }

    if (id) {
      // Update existing goal
      const goalIndex = goalDoc.goals.findIndex((g) => g._id.toString() === id);
      if (goalIndex !== -1) {
        goalDoc.goals[goalIndex] = { ...goalDoc.goals[goalIndex], name, targetAmount, currentAmount, category };
      } else {
        return res.status(404).json({ message: 'Goal not found' });
      }
    } else {
      // Add new goal
      goalDoc.goals.push({ name, targetAmount, currentAmount, category });
    }

    await goalDoc.save();
    res.status(201).json(goalDoc.goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const financialYear = req.query.year || req.query.financialYear;
    const { id } = req.params;

    const goalDoc = await Goal.findOne({ user: req.user._id, financialYear });
    if (!goalDoc) {
      return res.status(404).json({ message: 'Goal record not found' });
    }

    goalDoc.goals = goalDoc.goals.filter((g) => g._id.toString() !== id);
    await goalDoc.save();

    res.json(goalDoc.goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI insights for a goal
// @route   GET /api/goals/:id/insights
// @access  Private
const getGoalInsights = async (req, res) => {
  try {
    const financialYear = req.query.year || req.query.financialYear;
    const { id } = req.params;

    const goalDoc = await Goal.findOne({ user: req.user._id, financialYear });
    if (!goalDoc) {
      return res.status(404).json({ message: 'Goal record not found' });
    }

    const goal = goalDoc.goals.find((g) => g._id.toString() === id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Fetch income and expense data for the same financial year
    const incomeData = await Income.find({ user: req.user._id, financialYear });
    const expenseData = await Expense.find({ user: req.user._id, financialYear });

    const insights = await aiService.generateGoalInsights(goal, incomeData, expenseData);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGoals,
  upsertGoal,
  deleteGoal,
  getGoalInsights,
};
