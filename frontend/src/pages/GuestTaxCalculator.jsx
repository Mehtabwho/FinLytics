import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Lock,
  Zap,
  BarChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Card } from '../components/Card';
import { PageTransition } from '../components/Animations';

const GuestTaxCalculator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
      <div className="min-h-screen bg-white font-sans text-slate-900">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                F
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">FinLytics</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="primary" className="px-6 py-2.5 rounded-xl text-sm font-bold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                <Zap size={14} />
                Instant Tax Intelligence
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
                Master Your Taxes in <span className="text-primary">60 Seconds.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Professional tax estimation for Bangladeshi taxpayers. Zero login required. Start planning your savings today.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="pb-24 px-4 relative">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Side */}
                <div className="lg:col-span-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="p-8 shadow-2xl shadow-slate-200/50 border-slate-100">
                      <div className="space-y-8">
                        {/* Section 1 */}
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                            Personal Profile
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">Assessment Year</label>
                              <select 
                                name="assessmentYear"
                                value={formData.assessmentYear}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-white font-medium"
                              >
                                <option>2024-2025</option>
                                <option>2025-2026</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">Taxpayer Category</label>
                              <select 
                                name="taxpayerCategory"
                                value={formData.taxpayerCategory}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-white font-medium"
                              >
                                <option value="General">General</option>
                                <option value="Women+65">Women / Senior (65+)</option>
                                <option value="Disabled">Physically Challenged</option>
                                <option value="Freedom Fighter">Freedom Fighter</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Section 2 */}
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center text-sm">2</span>
                            Income & Wealth
                          </h2>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">Net Annual Income (BDT)</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                                <input 
                                  required
                                  type="number"
                                  name="netAnnualIncome"
                                  value={formData.netAnnualIncome}
                                  onChange={handleChange}
                                  placeholder="e.g. 1,200,000"
                                  className="w-full pl-10 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg font-bold"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 3 */}
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center text-sm">3</span>
                            Investment Portfolio
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { label: 'DPS Savings', name: 'investments.dps' },
                              { label: 'Savings Certificate', name: 'investments.savingsCertificate' },
                              { label: 'Life Insurance', name: 'investments.insurance' },
                              { label: 'Other Investments', name: 'investments.others' },
                            ].map((inv) => (
                              <div key={inv.name} className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">{inv.label}</label>
                                <input 
                                  type="number"
                                  name={inv.name}
                                  value={inv.name.split('.').reduce((obj, key) => obj[key], formData)}
                                  onChange={handleChange}
                                  placeholder="0"
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={loading}
                          className="w-full py-5 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                        >
                          {loading ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              Calculate My Estimate
                              <ArrowRight size={24} />
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </form>
                </div>

                {/* Info Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="p-8 bg-slate-900 rounded-[32px] text-white space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <Sparkles className="text-primary w-10 h-10 mb-4" />
                    <h3 className="text-2xl font-bold leading-tight">Why use FinLytics?</h3>
                    <ul className="space-y-4">
                      {[
                        "Latest 2024-25 NBR Regulations",
                        "Investment Rebate Optimization",
                        "Instant Privacy-First Calculation",
                        "No Credit Card Required"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                          <CheckCircle2 className="text-primary shrink-0" size={18} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-8 bg-primary/5 border border-primary/10 rounded-[32px] space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <ShieldCheck className="text-primary" size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900">Your Data is Secure</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Calculations are performed in real-time. We do not store any personal financial data entered in the guest calculator.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {results && (
            <motion.section 
              id="results-section"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-24 px-4 bg-slate-50"
            >
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-black text-slate-900 mb-4">Your Tax Estimation</h2>
                  <p className="text-slate-500">Based on current NBR slabs and your provided information.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Results Card */}
                  <div className="lg:col-span-7">
                    <Card className="p-10 border-none shadow-2xl shadow-primary/10 overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left">
                          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Net Tax Payable</span>
                          <div className="text-6xl font-black text-primary mt-2">
                            {formatCurrency(results.netTax)}
                          </div>
                          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <TrendingUp size={14} />
                            Includes ৳{results.rebate.toLocaleString()} Rebate
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                          <div className="p-4 bg-slate-50 rounded-2xl text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Tax</p>
                            <p className="font-bold text-slate-900">৳{results.grossTax.toLocaleString()}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Taxable</p>
                            <p className="font-bold text-slate-900">৳{results.taxableIncome.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                      <AlertCircle className="text-amber-500 shrink-0" size={24} />
                      <p className="text-sm text-amber-800 leading-relaxed font-medium">
                        {results.disclaimer}
                      </p>
                    </div>
                  </div>

                  {/* Conversion Card */}
                  <div className="lg:col-span-5">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-8 bg-primary rounded-[40px] text-white shadow-2xl shadow-primary/40 relative overflow-hidden"
                    >
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                      <Sparkles className="text-secondary w-12 h-12 mb-6" />
                      <h3 className="text-3xl font-black mb-4">Go Beyond Estimates.</h3>
                      <p className="text-primary-light text-lg mb-8 leading-relaxed">
                        Unlock professional tools to optimize your wealth and automate your tax filing.
                      </p>
                      
                      <div className="space-y-4 mb-8">
                        {[
                          { icon: <Zap size={18} />, text: "AI-Powered Saving Tips" },
                          { icon: <BarChart size={18} />, text: "Multi-Year Tax History" },
                          { icon: <Lock size={18} />, text: "Secure Document Storage" }
                        ].map((feat, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm font-bold text-white/80">
                            <div className="text-secondary">{feat.icon}</div>
                            {feat.text}
                          </div>
                        ))}
                      </div>

                      <Link to="/register">
                        <Button variant="secondary" className="w-full py-4 rounded-2xl text-lg font-black flex items-center justify-center gap-2 group">
                          Unlock Full Power
                          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-100 text-center">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
              <div className="w-6 h-6 bg-slate-900 rounded-lg" />
              <span className="font-bold tracking-tight">FinLytics</span>
            </div>
            <p className="text-slate-400 text-sm italic">
              "Smart finance for smart businesses."
            </p>
            <p className="text-slate-300 text-xs mt-8 uppercase tracking-widest font-bold">
              © 2024 FinLytics AI Solutions
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default GuestTaxCalculator;
