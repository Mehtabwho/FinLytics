import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, Building2, ArrowRight, TrendingUp, CheckCircle2 } from 'lucide-react';

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
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10 shadow-lg">
              <TrendingUp className="text-secondary" size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FinLytics</h1>
          </div>
          
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Join the Future of <br/>
            <span className="text-secondary">SME Finance</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-lg leading-relaxed mb-8">
            Create your account today and start making smarter financial decisions with AI-powered insights.
          </p>

          <div className="space-y-4">
            {[
              "Automated Tax Calculations",
              "AI Expense Categorization",
              "Real-time Profit Tracking",
              "NBR Compliant Reports"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-200">
                <CheckCircle2 className="text-secondary" size={20} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 mt-12 text-xs text-slate-400">
          © 2024 FinLytics. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white lg:bg-slate-50 h-screen overflow-y-auto">
        <div className="w-full max-w-lg bg-white lg:p-10 lg:rounded-3xl lg:shadow-xl lg:border lg:border-slate-100 my-auto">
          <div className="mb-8 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
               <div className="bg-primary p-2.5 rounded-xl inline-flex">
                  <TrendingUp className="text-secondary" size={28} />
               </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h2>
            <p className="text-slate-500">Get started with FinLytics in seconds.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-fadeIn">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Business Type</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  name="businessType"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400"
                  placeholder="e.g. Retail, Software, Manufacturing"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Taxpayer Category</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <select
                  name="taxpayerCategory"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 appearance-none cursor-pointer"
                  value={formData.taxpayerCategory}
                  onChange={handleChange}
                >
                  <option value="general">General</option>
                  <option value="female">Female</option>
                  <option value="senior_citizen">Senior Citizen (65+)</option>
                  <option value="freedom_fighter">Freedom Fighter</option>
                  <option value="physically_challenged">Physically Challenged</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                   <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-1">Used for calculating your tax-free income threshold.</p>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary-dark focus:ring-4 focus:ring-primary/20 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account? <Link to="/login" className="text-primary font-semibold hover:text-primary-dark transition-colors hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
