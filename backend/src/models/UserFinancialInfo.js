const mongoose = require('mongoose');
const { getFinancialYear } = require('../utils/financialYearHelper');

const userFinancialInfoSchema = new mongoose.Schema({
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
  taxpayerCategory: {
    type: String,
    enum: ['general', 'female', 'senior_citizen', 'freedom_fighter', 'physically_challenged'],
  },
  businessType: {
    type: String,
  },
  // Add other year-specific fields here as needed, e.g., rebate related info
}, {
  timestamps: true,
});

// Ensure unique combination of user and financialYear
userFinancialInfoSchema.index({ user: 1, financialYear: 1 }, { unique: true });

const UserFinancialInfo = mongoose.model('UserFinancialInfo', userFinancialInfoSchema);

module.exports = UserFinancialInfo;
