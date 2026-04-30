const mongoose = require('mongoose');
const { getFinancialYear } = require('../utils/financialYearHelper');

const goalItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  targetAmount: {
    type: Number,
    required: true,
  },
  currentAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: String,
    default: 'Other',
  },
}, {
  timestamps: true,
});

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  financialYear: {
    type: String,
    required: true,
    default: () => getFinancialYear(),
  },
  goals: [goalItemSchema],
}, {
  timestamps: true,
});

// Ensure unique combination of user and financialYear
goalSchema.index({ user: 1, financialYear: 1 }, { unique: true });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;
