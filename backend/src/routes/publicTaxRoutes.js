const express = require('express');
const router = express.Router();

/**
 * @desc    Calculate tax estimate for public/guest users
 * @route   POST /api/public/tax-estimate
 * @access  Public
 */
router.post('/tax-estimate', (req, res) => {
  try {
    const {
      assessmentYear,
      taxpayerType,
      taxpayerCategory,
      incomeLocation,
      netAnnualIncome,
      investments,
      alreadyPaidTax,
      netAsset
    } = req.body;

    // 1. TAX-FREE THRESHOLD
    let threshold = 350000; // General
    if (taxpayerCategory === 'Women+65') threshold = 400000;
    else if (taxpayerCategory === 'Disabled') threshold = 475000;
    else if (taxpayerCategory === 'Freedom Fighter') threshold = 500000;

    // 2. TAXABLE INCOME
    const income = Number(netAnnualIncome) || 0;
    const taxableIncome = Math.max(income - threshold, 0);

    // 3. PROGRESSIVE TAX SLABS
    const calculateGrossTax = (incomeAmount) => {
      let tax = 0;
      let remaining = incomeAmount;

      // Slab 1: First 100,000 @ 5%
      const slab1 = Math.min(remaining, 100000);
      tax += slab1 * 0.05;
      remaining -= slab1;
      if (remaining <= 0) return tax;

      // Slab 2: Next 300,000 @ 10%
      const slab2 = Math.min(remaining, 300000);
      tax += slab2 * 0.10;
      remaining -= slab2;
      if (remaining <= 0) return tax;

      // Slab 3: Next 400,000 @ 15%
      const slab3 = Math.min(remaining, 400000);
      tax += slab3 * 0.15;
      remaining -= slab3;
      if (remaining <= 0) return tax;

      // Slab 4: Remaining @ 20%
      tax += remaining * 0.20;

      return tax;
    };

    const grossTax = calculateGrossTax(taxableIncome);

    // 4. REBATE LOGIC
    const totalInvestment = Object.values(investments || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
    
    // rebate = min(totalInvestment * 0.15, taxableIncome * 0.03, 100000)
    const rebate = Math.min(
      totalInvestment * 0.15,
      taxableIncome * 0.03,
      100000
    );

    // 5. FINAL TAX
    const netTax = Math.max(grossTax - rebate, 0);
    const alreadyPaid = Number(alreadyPaidTax) || 0;
    const finalAmount = netTax - alreadyPaid;
    const type = finalAmount < 0 ? 'refund' : 'payable';

    res.json({
      taxableIncome,
      grossTax,
      rebate,
      netTax,
      alreadyPaid,
      finalAmount: Math.abs(finalAmount),
      type,
      disclaimer: "This is an estimated calculation. Login for full AI-powered tax analysis."
    });
  } catch (error) {
    console.error('Public Tax Calculation Error:', error);
    res.status(500).json({ message: 'Error calculating tax estimate' });
  }
});

module.exports = router;
