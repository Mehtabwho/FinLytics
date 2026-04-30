import React, { useState } from 'react';
import axios from 'axios';
import { 
  Calculator, 
  User, 
  Building2, 
  Briefcase, 
  Info, 
  CheckCircle2, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { Card } from '../components/Card';
import { PageTransition } from '../components/Animations';

const GuestTaxCalculator = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState({
    assessmentYear: '2025-2026',
    taxpayerType: 'Individual',
    taxpayerCategory: 'General',
    incomeLocation: 'Dhaka/Chattogram',
    netAnnualIncome: '',
    investments: {
      dps: '',
      savingsCertificate: '',
      insurance: '',
      others: ''
    },
    alreadyPaidTax: '',
    netAsset: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/public/tax-estimate', formData);
      setResults(response.data);
    } catch (error) {
      console.error('Calculation Error:', error);
      alert('Error calculating tax estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('BDT', '৳');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
                <Calculator className="text-primary w-10 h-10" />
                FinLytics <span className="text-primary">Tax Estimator</span>
              </h1>
              <p className="mt-2 text-lg text-slate-600">Free public tax calculator for Bangladeshi taxpayers.</p>
            </div>
            <Link 
              to="/login" 
              className="flex items-center gap-2 text-slate-500 hover:text-primary font-semibold transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
            >
              <ArrowLeft size={18} />
              Back to Login
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDEBAR (Static UI) */}
            <div className="hidden lg:block lg:col-span-2 space-y-4">
              <div className="p-5 bg-gradient-to-br from-primary to-blue-600 rounded-3xl text-white shadow-lg">
                <Sparkles className="mb-3 opacity-80" />
                <h4 className="font-bold text-lg mb-1">Upgrade to AI</h4>
                <p className="text-xs text-white/80 leading-relaxed">Get personalized tax-saving strategies with our AI Advisor.</p>
              </div>
            </div>

            {/* CENTER PANEL (MAIN FORM) */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-0 overflow-hidden border-slate-200">
                  <div className="bg-slate-50 p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Info className="text-primary" size={20} />
                      Section 1: Basic Information
                    </h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Assessment Year</label>
                      <select 
                        name="assessmentYear"
                        value={formData.assessmentYear}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                      >
                        <option>2024-2025</option>
                        <option>2025-2026</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Taxpayer Type</label>
                      <select 
                        name="taxpayerType"
                        value={formData.taxpayerType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                      >
                        <option>Individual</option>
                        <option>Firm</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Taxpayer Category</label>
                      <select 
                        name="taxpayerCategory"
                        value={formData.taxpayerCategory}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                      >
                        <option value="General">General</option>
                        <option value="Women+65">Women / Senior (65+)</option>
                        <option value="Disabled">Physically Challenged</option>
                        <option value="Freedom Fighter">Freedom Fighter</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Income Location</label>
                      <select 
                        name="incomeLocation"
                        value={formData.incomeLocation}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                      >
                        <option>Dhaka/Chattogram City Corp</option>
                        <option>Other City Corp</option>
                        <option>Outside City Corp</option>
                      </select>
                    </div>
                  </div>
                </Card>

                <Card className="p-0 overflow-hidden border-slate-200">
                  <div className="bg-slate-50 p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="text-green-500" size={20} />
                      Section 2: Annual Income
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Net Annual Income (BDT)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                        <input 
                          required
                          type="number"
                          name="netAnnualIncome"
                          value={formData.netAnnualIncome}
                          onChange={handleChange}
                          placeholder="e.g. 800,000"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-0 overflow-hidden border-slate-200">
                  <div className="bg-slate-50 p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <PiggyBank className="text-blue-500" size={20} />
                      Section 3: Investment Details
                    </h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">DPS Investment (Annual)</label>
                      <input 
                        type="number"
                        name="investments.dps"
                        value={formData.investments.dps}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Savings Certificate</label>
                      <input 
                        type="number"
                        name="investments.savingsCertificate"
                        value={formData.investments.savingsCertificate}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Insurance Premium</label>
                      <input 
                        type="number"
                        name="investments.insurance"
                        value={formData.investments.insurance}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Other Investments</label>
                      <input 
                        type="number"
                        name="investments.others"
                        value={formData.investments.others}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-0 overflow-hidden border-slate-200">
                  <div className="bg-slate-50 p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <CreditCard className="text-purple-500" size={20} />
                      Section 4: Additional Info
                    </h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Already Paid Tax (TDS/AIT)</label>
                      <input 
                        type="number"
                        name="alreadyPaidTax"
                        value={formData.alreadyPaidTax}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Net Asset (Optional)</label>
                      <input 
                        type="number"
                        name="netAsset"
                        value={formData.netAsset}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </Card>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-5 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Calculator size={24} />
                      Calculate Estimate
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* RIGHT PANEL (RESULT DASHBOARD) */}
            <div className="lg:col-span-3">
              <div className="sticky top-8 space-y-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Result Summary</h3>
                <AnimatePresence mode="wait">
                  {!results ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-8 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3"
                    >
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                        <Calculator size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">Enter details to see your tax estimate</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <ResultCard 
                        icon={<TrendingUp className="text-blue-500" />}
                        title="Taxable Income"
                        description="Income after threshold"
                        value={results.taxableIncome}
                        color="blue"
                      />
                      <ResultCard 
                        icon={<ShieldCheck className="text-indigo-500" />}
                        title="Gross Tax"
                        description="Tax before rebate"
                        value={results.grossTax}
                        color="indigo"
                      />
                      <ResultCard 
                        icon={<PiggyBank className="text-emerald-500" />}
                        title="Tax Rebate"
                        description="Investment savings"
                        value={results.rebate}
                        color="emerald"
                      />
                      <ResultCard 
                        icon={<Wallet className="text-primary" />}
                        title="Net Tax"
                        description="After investment rebate"
                        value={results.netTax}
                        color="primary"
                      />
                      <ResultCard 
                        icon={<CreditCard className="text-slate-500" />}
                        title="Already Paid"
                        description="TDS / AIT paid"
                        value={results.alreadyPaid}
                        color="slate"
                      />
                      
                      <div className={`p-6 rounded-3xl border shadow-lg ${
                        results.type === 'refund' 
                          ? 'bg-green-50 border-green-200 shadow-green-200/20' 
                          : 'bg-primary/5 border-primary/20 shadow-primary/10'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-xl ${
                            results.type === 'refund' ? 'bg-green-500' : 'bg-primary'
                          } text-white`}>
                            {results.type === 'refund' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                          </div>
                          <span className={`font-bold text-sm ${
                            results.type === 'refund' ? 'text-green-700' : 'text-primary'
                          } uppercase tracking-wider`}>
                            {results.type === 'refund' ? 'Refundable' : 'Final Payable'}
                          </span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">
                          {formatCurrency(results.finalAmount)}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 font-medium">
                          {results.disclaimer}
                        </p>
                      </div>

                      {/* CTA */}
                      <div className="mt-6 p-6 bg-slate-900 rounded-3xl text-white space-y-4">
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <Sparkles size={18} />
                          <span>Unlock Full Power</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          Login to get AI-powered tax optimization and save your reports securely.
                        </p>
                        <button 
                          className="w-full py-3 bg-primary hover:bg-primary-dark rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                          onClick={() => window.location.href = '/login'}
                        >
                          Login for Full Report
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const ResultCard = ({ icon, title, description, value, color }) => (
  <Card className="p-4 border-slate-100 hover:border-slate-200 transition-all group">
    <div className="flex items-center gap-4">
      <div className={`p-3 bg-${color}-50 rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{description}</p>
        <p className="text-lg font-bold text-slate-900 mt-0.5">
          {new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value).replace('BDT', '৳')}
        </p>
      </div>
    </div>
  </Card>
);

export default GuestTaxCalculator;
