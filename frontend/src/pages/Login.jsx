import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, TrendingUp, ShieldCheck, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { StaggerContainer } from '../components/Animations';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 opacity-90"></div>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-slate-800/70 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/50 shadow-lg">
              <TrendingUp className="text-cyan-400" size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">FinLytics</h1>
          </div>
          
          <h2 className="text-4xl font-bold leading-tight mb-6 text-slate-100">
            Smart Financial Intelligence <br/>
            <span className="gradient-text">for Your Business</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
            Manage income, expenses, and taxes with AI-driven insights tailored for Bangladesh. 
            Automate your accounting and focus on growth.
          </p>
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
          <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800/70 transition-colors">
            <ShieldCheck className="text-emerald-400 mb-3" size={28} />
            <h3 className="font-semibold text-lg mb-1 text-slate-100">NBR Compliant</h3>
            <p className="text-sm text-slate-400">Updated for Tax Year 2024-25</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800/70 transition-colors">
            <TrendingUp className="text-cyan-400 mb-3" size={28} />
            <h3 className="font-semibold text-lg mb-1 text-slate-100">Smart Analytics</h3>
            <p className="text-sm text-slate-400">AI-powered profit tracking</p>
          </div>
        </div>
        
        <div className="relative z-10 mt-12 text-xs text-slate-500">
          © 2024 FinLytics. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md glass-card lg:p-10 rounded-3xl">
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
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Unlock Full Features</h2>
            <p className="text-slate-400">Sign in to access AI insights and financial history.</p>
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

          <StaggerContainer delay={0.08}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <motion.input
                    type="email"
                    whileFocus={{ scale: 1.02 }}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100 placeholder:text-slate-500"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-300">Password</label>
                  <a href="#" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">Forgot password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <motion.input
                    type="password"
                    whileFocus={{ scale: 1.02 }}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100 placeholder:text-slate-500"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </StaggerContainer>

          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account? <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors hover:underline">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;