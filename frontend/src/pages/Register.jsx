import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, Building2, ArrowRight, TrendingUp, CheckCircle2, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { StaggerContainer } from '../components/Animations';
import Button from '../components/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessType: '',
    taxpayerCategory: 'general',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 opacity-90"></div>
        
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-slate-800/70 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/50 shadow-lg">
              <TrendingUp className="text-cyan-400" size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">FinLytics</h1>
          </div>
          
          <h2 className="text-4xl font-bold leading-tight mb-6 text-slate-100">
            Join the Future of <br/>
            <span className="gradient-text">SME Finance</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-lg leading-relaxed mb-8">
            Create your account today and start making smarter financial decisions with AI-powered insights.
          </p>

          <div className="space-y-4">
            {[
              "Automated Tax Calculations",
              "AI Expense Categorization",
              "Real-time Profit Tracking",
              "NBR Compliant Reports"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="text-emerald-400" size={20} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 mt-12 text-xs text-slate-500">
          © 2024 FinLytics. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-950 h-screen overflow-y-auto">
        <div className="w-full max-w-lg glass-card lg:p-10 rounded-3xl my-auto">
          {/* Back Button */}
          <div className="mb-4">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm">
              <ArrowRight size={16} className="rotate-180" />
              Back to Guest Calculator
            </Link>
          </div>
          <div className="mb-6 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
               <div className="bg-gradient-to-br from-cyan-500 to-emerald-500 p-2.5 rounded-xl inline-flex">
                  <TrendingUp className="text-white" size={28} />
               </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Unlock Premium Insights</h2>
            <p className="text-slate-400">Create an account to track taxes and get AI advice.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {error}
            </motion.div>
          )}

          <StaggerContainer delay={0.06}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                    <motion.input
                      type="text"
                      name="name"
                      whileFocus={{ scale: 1.02 }}
                      className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100 placeholder:text-slate-500"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                    <motion.input
                      type="email"
                      name="email"
                      whileFocus={{ scale: 1.02 }}
                      className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100 placeholder:text-slate-500"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <motion.input
                    type="password"
                    name="password"
                    whileFocus={{ scale: 1.02 }}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100 placeholder:text-slate-500"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Business Type</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <motion.input
                    type="text"
                    name="businessType"
                    whileFocus={{ scale: 1.02 }}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100 placeholder:text-slate-500"
                    placeholder="e.g. Retail, Software, Manufacturing"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Taxpayer Category</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <motion.select
                    name="taxpayerCategory"
                    whileFocus={{ scale: 1.02 }}
                    className="w-full pl-11 pr-10 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100 appearance-none cursor-pointer"
                    value={formData.taxpayerCategory}
                    onChange={handleChange}
                  >
                    <option value="general">General</option>
                    <option value="female">Female</option>
                    <option value="senior_citizen">Senior Citizen (65+)</option>
                    <option value="freedom_fighter">Freedom Fighter</option>
                    <option value="physically_challenged">Physically Challenged</option>
                  </motion.select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-1">Used for calculating your tax-free income threshold.</p>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-6">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </StaggerContainer>

          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account? <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;