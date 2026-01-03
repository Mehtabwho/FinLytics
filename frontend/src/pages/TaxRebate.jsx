import { useMemo, useState, useEffect } from 'react';
import { Calculator, Percent, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition, StaggerContainer } from '../components/Animations';
import api from '../api/axios';
import { useFinancialYear } from '../context/FinancialYearContext';

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
  const { year } = useFinancialYear();
  const [taxableIncome, setTaxableIncome] = useState('');
  const [inputs, setInputs] = useState(
    INVESTMENT_RULES.reduce((acc, r) => {
      acc[r.key] = '';
      return acc;
    }, {})
  );
  const [incomeTax, setIncomeTax] = useState(0);
  const [advisor, setAdvisor] = useState(null);
  const [advisorError, setAdvisorError] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);

  const handleInput = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleTaxableIncomeChange = (value) => {
    setTaxableIncome(value);
  };

  useEffect(() => {
    const loadTax = async () => {
      try {
        const { data } = await api.get('/tax/calculate');
        setIncomeTax(data.taxPayable || 0);
      } catch (e) {
        setIncomeTax(0);
      }
    };
    loadTax();
    setAdvisor(null);
    setAdvisorError('');
    setAdvisorLoading(false);
  }, [year]);

  const analyzeAdvisor = async () => {
    setAdvisorError('');
    setAdvisorLoading(true);
    try {
      const { data: ai } = await api.post('/ai/rebate-advisor', { incomeTax, taxYear: year });
      setAdvisor(ai.insights);
    } catch (e) {
      setAdvisor(null);
      setAdvisorError('AI insights are temporarily unavailable. Your rebate calculation is unaffected.');
    } finally {
      setAdvisorLoading(false);
    }
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
    const netPayable = taxableIncome - totalRebate;
    return { totalRebate, netPayable, income };
  }, [breakdown, taxableIncome]);

  const netPayableTax = useMemo(() => {
    return Math.max(0, incomeTax - breakdown.reduce((sum, b) => sum + b.rebate, 0));
  }, [incomeTax, breakdown]);

  const addToCalculator = (option, amount) => {
    const found = INVESTMENT_RULES.find(r => r.label.toLowerCase() === String(option || '').toLowerCase() || String(option || '').toLowerCase().includes(r.label.toLowerCase()));
    if (!found) return;
    setInputs(prev => ({ ...prev, [found.key]: amount }));
  };

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
              <h1 className="text-2xl font-bold text-slate-800">Tax Rebate Advisor & Calculator </h1>
              <p className="text-sm text-slate-500">Compute allowable tax rebates across investments with caps and rules.</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-xl border border-slate-800/40"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">🧠</span>
              </div>
              <h2 className="text-xl font-semibold">AI Tax Rebate Advisor</h2>
            </div>
            {!advisor && (
              <button 
                onClick={analyzeAdvisor} 
                disabled={advisorLoading}
                className="text-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {advisorLoading ? 'Analyzing...' : 'Analyze Now'}
              </button>
            )}
          </div>
          {advisorLoading ? (
            <div className="text-slate-300 text-sm">Analyzing your tax level...</div>
          ) : advisorError ? (
            <div className="text-slate-300 text-sm">{advisorError}</div>
          ) : advisor && advisor.summary && advisor.suggestions?.length ? (
            <div className="space-y-4">
              <p className="text-slate-200 text-sm leading-relaxed">{advisor.summary}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {advisor.suggestions?.map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{s.option}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 border border-white/10">{s.risk}</span>
                    </div>
                    <div className="text-sm text-slate-300 mb-2">Suggested Amount: {formatCurrency(s.suggestedAmount)}</div>
                    <div className="text-xs text-slate-300 mb-3 leading-relaxed">{s.reason}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-400">{advisor.disclaimer}</div>
            </div>
          ) : (
            <div className="text-slate-300 text-sm italic border border-white/10 rounded-xl p-4 bg-white/5">
              <p className="mb-2">Click "Analyze Now" to get investment suggestions commonly used by Bangladesh taxpayers with similar tax levels.</p>
            </div>
          )}
        </motion.div>

      {/* Taxable Income */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-1">
           <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-500">Income Tax</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(incomeTax)}</p>
            </div>
          </div>
        </div>

        {/* Aggregate Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-500">Total Rebate (before cap)</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(totals.totalRebate)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-500">Net Payable Tax</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(netPayableTax)}</p>
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
