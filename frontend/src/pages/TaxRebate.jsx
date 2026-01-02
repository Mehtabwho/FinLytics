import { useMemo, useState } from 'react';
import { Calculator, Percent, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition, StaggerContainer } from '../components/Animations';

// Tax Rebate rules for Bangladesh (as provided)
const INVESTMENT_RULES = [
  {
    key: 'dse',
    label: 'DSE Shares',
    allowablePct: 0.15,
    taxRate: 0.15,
    maxLimit: 5_000_000, // 50 Lakh
  },
  {
    key: 'sanchaypatra',
    label: 'Sanchaypatra',
    allowablePct: 0.10,
    taxRate: 0.10,
    maxLimit: 7_500_000, // 75 Lakh
  },
  {
    key: 'dps',
    label: 'DPS (Deposit Pension Scheme)',
    allowablePct: 0.15,
    taxRate: 0.15,
    maxLimit: 15_000_000, // 1.5 Crore
  },
  {
    key: 'gov_bonds',
    label: 'Government Bonds',
    allowablePct: 0.10,
    taxRate: 0.10,
    maxLimit: 2_500_000, // 25 Lakh
  },
  {
    key: 'mutual',
    label: 'Mutual Funds',
    allowablePct: 0.15,
    taxRate: 0.15,
    maxLimit: 5_000_000, // 50 Lakh
  },
  {
    key: 'life',
    label: 'Life Insurance',
    allowablePct: 0.10,
    taxRate: 0.10,
    maxLimit: 12_000_000, // 1.2 Crore
  },
  {
    key: 'pf',
    label: 'Provident Fund (Employee Contribution)',
    allowablePct: 1.0, // 100%
    taxRate: 0.15,
    maxLimit: null, // No explicit cap provided in rules
  },
];

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return `৳${num.toLocaleString('en-US')}`;
};

const clampNumber = (n) => (isNaN(n) || n < 0 ? 0 : n);
// Parse inputs that may include commas, currency symbol, or spaces
const parseBDT = (value) => {
  if (typeof value === 'number') return clampNumber(value);
  const cleaned = String(value || '').replace(/[^0-9.-]/g, '');
  const n = Number(cleaned);
  return clampNumber(n);
};

const TaxRebate = () => {
  const [taxableIncome, setTaxableIncome] = useState('');
  const [inputs, setInputs] = useState(
    INVESTMENT_RULES.reduce((acc, r) => {
      acc[r.key] = '';
      return acc;
    }, {})
  );

  const handleInput = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleTaxableIncomeChange = (value) => {
    setTaxableIncome(value);
  };

  const breakdown = useMemo(() => {
    return INVESTMENT_RULES.map((rule) => {
      const raw = parseBDT(inputs[rule.key]);
      const allowedInvestment = rule.maxLimit ? Math.min(raw, rule.maxLimit) : raw;
      const eligibleBase = allowedInvestment * rule.allowablePct;
      const rebate = eligibleBase * rule.taxRate;
      return {
        ...rule,
        raw,
        allowedInvestment,
        eligibleBase,
        rebate,
      };
    });
  }, [inputs]);

  const totals = useMemo(() => {
    const totalRebate = breakdown.reduce((sum, b) => sum + b.rebate, 0);
    const income = parseBDT(taxableIncome);
    const netPayable = taxableIncome - totalRebate; // Net payable tax after rebate
    return { totalRebate, netPayable, income };
  }, [breakdown, taxableIncome]);

  return (
    <PageTransition>
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Calculator size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Tax Rebate Calculator (Bangladesh)</h1>
              <p className="text-sm text-slate-500">Compute allowable tax rebates across investments with caps and rules.</p>
            </div>
          </div>
        </motion.div>

      {/* Taxable Income */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-1">
          <label className="text-sm text-slate-600 font-medium">Taxable Income (BDT)</label>
          <input
            type="text"
            value={taxableIncome}
            onChange={(e) => handleTaxableIncomeChange(e.target.value)}
            placeholder="Enter taxable income"
            className="mt-2 w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <p className="text-xs text-slate-500 mt-2">Parsed value: {formatCurrency(parseBDT(taxableIncome))}</p>
          {/* aggregate cap note removed as requested */}
        </div>

        {/* Aggregate Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-500">Total Rebate (before cap)</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(totals.totalRebate)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Percent size={18} className="text-primary" />
          <h2 className="font-semibold text-slate-700">Investments</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="p-3">Type</th>
                <th className="p-3">Investment Amount</th>
                <th className="p-3">Allowable %</th>
                <th className="p-3">Tax Rate</th>
                <th className="p-3">Max Limit</th>
                <th className="p-3">Eligible Base</th>
                <th className="p-3">Rebate</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((b) => (
                <tr key={b.key} className="border-t border-slate-100">
                  <td className="p-3 text-slate-700">{b.label}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={inputs[b.key]}
                      onChange={(e) => handleInput(b.key, e.target.value)}
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </td>
                  <td className="p-3">{Math.round(b.allowablePct * 100)}%</td>
                  <td className="p-3">{Math.round(b.taxRate * 100)}%</td>
                  <td className="p-3">{b.maxLimit ? formatCurrency(b.maxLimit) : 'N/A'}</td>
                  <td className="p-3 text-slate-700">{formatCurrency(b.eligibleBase)}</td>
                  <td className="p-3 font-medium text-slate-800">{formatCurrency(b.rebate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      </div>
    </PageTransition>
  );
};

export default TaxRebate;
