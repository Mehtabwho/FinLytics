import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react';

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
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-inter">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary via-primary to-slate-900 opacity-90"></div>
        
        {/* Abstract Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10 shadow-lg">
              <TrendingUp className="text-secondary" size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FinLytics</h1>
          </div>
          
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Smart Financial Intelligence <br/>
            <span className="text-secondary">for Your Business</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-lg leading-relaxed">
            Manage income, expenses, and taxes with AI-driven insights tailored for Bangladesh. 
            Automate your accounting and focus on growth.
          </p>
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
          <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <ShieldCheck className="text-secondary mb-3" size={28} />
            <h3 className="font-semibold text-lg mb-1">NBR Compliant</h3>
            <p className="text-sm text-slate-300">Updated for Tax Year 2024-25</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <TrendingUp className="text-secondary mb-3" size={28} />
            <h3 className="font-semibold text-lg mb-1">Smart Analytics</h3>
            <p className="text-sm text-slate-300">AI-powered profit tracking</p>
          </div>
        </div>
        
        <div className="relative z-10 mt-12 text-xs text-slate-400">
          © 2024 FinLytics. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-slate-50">
        <div className="w-full max-w-md bg-white lg:p-10 lg:rounded-3xl lg:shadow-xl lg:border lg:border-slate-100">
          <div className="mb-8 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
               <div className="bg-primary p-2.5 rounded-xl inline-flex">
                  <TrendingUp className="text-secondary" size={28} />
               </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h2>
            <p className="text-slate-500">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-fadeIn">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary-dark focus:ring-4 focus:ring-primary/20 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account? <Link to="/register" className="text-primary font-semibold hover:text-primary-dark transition-colors hover:underline">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
