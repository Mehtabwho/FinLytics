const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  source: {
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
}, {
  timestamps: true,
});

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
