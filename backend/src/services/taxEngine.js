const { getAssessmentYear } = require('../utils/financialYearHelper');

const BASE_CONFIG = {
  thresholds: {
    general: 350000,
    female: 400000,
    senior_citizen: 400000,
    physically_challenged: 475000,
    freedom_fighter: 500000,
  },
  slabs: [
    { limit: 100000, rate: 0.05 },
    { limit: 300000, rate: 0.10 },
    { limit: 400000, rate: 0.15 },
    { limit: 500000, rate: 0.20 },
    { limit: Infinity, rate: 0.25 },
  ],
  minimumTax: 5000,
};

const TAX_CONFIG = {
  '2023-2024': BASE_CONFIG,
  '2024-2025': BASE_CONFIG,
  '2025-2026': BASE_CONFIG,
  '2026-2027': BASE_CONFIG,
};

const calculateTax = (totalIncome, totalDeductibleExpenses, taxpayerCategory, financialYear = '2024-2025') => {
  // Fallback to 2024-2025 config if specific year not found, or use BASE_CONFIG
  const config = TAX_CONFIG[financialYear] || BASE_CONFIG;
  
  const assessmentYear = getAssessmentYear(financialYear);

  const taxableIncome = Math.max(0, totalIncome - totalDeductibleExpenses);
  let threshold = config.thresholds[taxpayerCategory] || config.thresholds.general;

  let remainingIncome = taxableIncome;
  let taxPayable = 0;
  const breakdown = [];

  // 1. Tax-free slab
  const taxFreeAmount = Math.min(remainingIncome, threshold);
  breakdown.push({ slab: `First ${threshold}`, amount: taxFreeAmount, rate: 0, tax: 0 });
  remainingIncome -= taxFreeAmount;

  // 2. Progressive slabs
  for (const slab of config.slabs) {
    if (remainingIncome <= 0) break;

    const taxableAmount = Math.min(remainingIncome, slab.limit);
    const taxForSlab = taxableAmount * slab.rate;
    
    taxPayable += taxForSlab;
    remainingIncome -= taxableAmount;

    breakdown.push({
      slab: slab.limit === Infinity ? 'Rest' : `Next ${slab.limit}`,
      amount: taxableAmount,
      rate: slab.rate,
      tax: taxForSlab
    });
  }

  return {
    financialYear,
    assessmentYear,
    totalIncome,
    totalDeductibleExpenses,
    taxableIncome,
    taxpayerCategory,
    taxFreeThreshold: threshold,
    taxPayable: Math.ceil(taxPayable), // Round up
    breakdown,
  };
};

module.exports = { calculateTax };
