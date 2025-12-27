const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  financialYear: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  isDeductible: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
