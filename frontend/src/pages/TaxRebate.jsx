import { useMemo, useState, useEffect } from 'react';
import { Calculator, Percent, Info, AlertCircle, CheckCircle2, ShieldAlert, TrendingUp, DollarSign, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition, StaggerContainer } from '../components/Animations';
import api from '../api/axios';
import { useFinancialYear } from '../context/FinancialYearContext';
import { Card } from '../components/Card';
import Button from '../components/Button';

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

const getEfficiencyColor = (efficiency) => {
  if (efficiency === 'High') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (efficiency === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-red-400 bg-red-500/10 border-red-500/20';
};

const getRiskColor = (risk) => {
  if (risk === 'Low risk') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (risk === 'Medium risk') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-red-400 bg-red-500/10 border-red-500/20';
};

const getLiquidityColor = (liquidity) => {
  if (liquidity === 'High') return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
  if (liquidity === 'Medium') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
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
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calculator size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Tax Rebate Advisor & Calculator </h1>
              <p className="text-sm text-slate-400">Compute allowable tax rebates across investments with caps and rules.</p>
            </div>
          </div>
        </motion.div>
        
        <StaggerContainer delay={0.1}>
          {/* AI Tax Rebate Advisor - Enhanced */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Card className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                    <Brain size={22} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-100">AI Tax Rebate Advisor</h2>
                    <p className="text-xs text-slate-500">Personalized recommendations based on your financial profile</p>
                  </div>
                </div>
                {!advisor && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={analyzeAdvisor} 
                    disabled={advisorLoading}
                    className="flex items-center gap-2"
                  >
                    {advisorLoading ? 'Analyzing...' : 'Analyze Now'}
                  </Button>
                )}
              </div>

              {advisorLoading ? (
                <div className="text-slate-400 text-sm flex items-center gap-2">
                  <div className="animate-pulse w-2 h-2 bg-amber-400 rounded-full"></div>
                  Analyzing your tax profile and financial situation...
                </div>
              ) : advisorError ? (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                  <AlertCircle size={18} className="inline mr-2" />
                  {advisorError}
                </div>
              ) : advisor && advisor.summary && advisor.suggestions?.length ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-gradient-to-r from-slate-800/70 to-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                    <p className="text-slate-300 text-sm leading-relaxed">{advisor.summary}</p>
                  </div>

                  {/* Suggestions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {advisor.suggestions?.map((s, i) => (
                      <Card key={i} className="p-5 border-2 border-slate-700/50" hover={true}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-100">{s.option}</h3>
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">Suggested Amount</p>
                            <p className="text-lg font-bold text-emerald-400">{formatCurrency(s.suggestedAmount)}</p>
                          </div>
                          <div className={`p-3 rounded-lg border ${getEfficiencyColor(s.estimatedRebateEfficiency)}`}>
                            <p className="text-xs mb-1">Rebate Efficiency</p>
                            <p className="text-sm font-bold">{s.estimatedRebateEfficiency}</p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`text-xs px-2 py-1 rounded-md border font-semibold ${getRiskColor(s.riskLevel)}`}>
                            {s.riskLevel}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-md border font-semibold ${getLiquidityColor(s.liquidityLevel)}`}>
                            {s.liquidityLevel} Liquidity
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-md border font-semibold ${
                            s.recommendationConfidence === 'High' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                            s.recommendationConfidence === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {s.recommendationConfidence} Confidence
                          </span>
                        </div>

                        {/* Suitable Because */}
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Suitable Because</p>
                          <ul className="space-y-1">
                            {s.suitableBecause?.map((reason, idx) => (
                              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Expected Impact */}
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Expected Impact</p>
                          <ul className="space-y-1">
                            {s.expectedImpact?.map((impact, idx) => (
                              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                <TrendingUp size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                                {impact}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Add to Calculator Button */}
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          fullWidth
                          onClick={() => addToCalculator(s.option, s.suggestedAmount)}
                          className="text-xs"
                        >
                          Add to Calculator
                        </Button>
                      </Card>
                    ))}
                  </div>

                  {/* Disclaimer */}
                  <div className="text-xs text-slate-500 bg-slate-800/30 border border-slate-700/50 p-3 rounded-lg">
                    <ShieldAlert size={14} className="inline mr-1" />
                    {advisor.disclaimer}
                  </div>
                </div>
              ) : (
                <div className="text-slate-300 text-sm border border-slate-700 rounded-xl p-6 bg-slate-800/30 text-center">
                  <Info size={32} className="mx-auto mb-3 text-slate-500 opacity-50" />
                  <p className="font-medium mb-2 text-slate-200">Get Personalized Rebate Recommendations</p>
                  <p className="text-slate-500 text-xs max-w-md mx-auto">
                    Click "Analyze Now" to receive investment suggestions tailored to your tax level and financial situation.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Taxable Income & Summary */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl border border-slate-700 lg:col-span-1">
               <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-400">Income Tax</p>
                  <p className="text-xl font-bold text-slate-100 mt-1">{formatCurrency(incomeTax)}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl border border-slate-700 lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-400">Total Rebate (before cap)</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(totals.totalRebate)}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-400">Net Payable Tax</p>
                  <p className="text-xl font-bold text-slate-100 mt-1">{formatCurrency(netPayableTax)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Investment Table */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="glass-card p-6 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Percent size={18} className="text-cyan-400" />
              <h2 className="font-semibold text-slate-200">Investments</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-700">
                    <th className="p-3">Type</th>
                    <th className="p-3">Investment Amount</th>
                    <th className="p-3">Allowable %</th>
                    <th className="p-3">Tax Rate</th>
                    <th className="p-3">Max Limit</th>
                    <th className="p-3">Eligible Base</th>
                    <th className="p-3">Rebate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {breakdown.map((b) => (
                    <tr key={b.key} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 text-slate-200">{b.label}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={inputs[b.key]}
                          onChange={(e) => handleInput(b.key, e.target.value)}
                          placeholder="0"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none text-slate-100"
                        />
                      </td>
                      <td className="p-3 text-slate-300">{Math.round(b.allowablePct * 100)}%</td>
                      <td className="p-3 text-slate-300">{Math.round(b.taxRate * 100)}%</td>
                      <td className="p-3 text-slate-300">{b.maxLimit ? formatCurrency(b.maxLimit) : 'N/A'}</td>
                      <td className="p-3 text-slate-200">{formatCurrency(b.eligibleBase)}</td>
                      <td className="p-3 font-medium text-emerald-400">{formatCurrency(b.rebate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </StaggerContainer>
      </div>
    </PageTransition>
  );
};

export default TaxRebate;