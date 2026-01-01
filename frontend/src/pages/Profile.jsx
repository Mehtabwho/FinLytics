import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useFinancialYear } from '../context/FinancialYearContext';
import { User, Mail, Briefcase, Building2, Calendar } from 'lucide-react';
import { PageTransition, StaggerContainer } from '../components/Animations';
import { Card } from '../components/Card';
import { SkeletonCard } from '../components/Skeleton';
import Button from '../components/Button';

const Profile = () => {
  const { year } = useFinancialYear();
  const [globalProfile, setGlobalProfile] = useState({
    name: '',
    email: '',
  });
  const [financialProfile, setFinancialProfile] = useState({
    businessType: '',
    taxpayerCategory: 'general',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, financialRes] = await Promise.all([
             api.get('/auth/profile'),
             api.get('/auth/financial-info')
        ]);

        setGlobalProfile({
            name: profileRes.data.name,
            email: profileRes.data.email,
        });

        setFinancialProfile({
            businessType: financialRes.data.businessType || '',
            taxpayerCategory: financialRes.data.taxpayerCategory || 'general',
        });

      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  const handleGlobalChange = (e) => {
    setGlobalProfile({ ...globalProfile, [e.target.name]: e.target.value });
  };

  const handleFinancialChange = (e) => {
    setFinancialProfile({ ...financialProfile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      // Update global profile
      await api.put('/auth/profile', globalProfile);

      // Update financial info for the specific year
      await api.put('/auth/financial-info', {
          ...financialProfile,
          financialYear: year
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    }
  };

  if (loading) return (
    <PageTransition>
      <div className="space-y-6">
        <SkeletonCard />
        {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-3 bg-gradient-to-br from-primary to-primary-light rounded-xl shadow-lg">
            <User className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-sm text-slate-500">Manage your profile and preferences</p>
          </div>
        </motion.div>

        {/* Message Alert */}
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {message.text}
          </motion.div>
        )}
        
        {/* Profile Form Card */}
        <Card>
          <StaggerContainer delay={0.08}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <motion.input
                      type="text"
                      name="name"
                      value={globalProfile.name}
                      onChange={handleGlobalChange}
                      whileFocus={{ scale: 1.02 }}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
                    />
                  </div>
                </motion.div>

                {/* Email Address */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={globalProfile.email}
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </motion.div>

                {/* Business Type */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Business Type (For {year})</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <motion.select
                      name="businessType"
                      value={financialProfile.businessType}
                      onChange={handleFinancialChange}
                      whileFocus={{ scale: 1.02 }}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 appearance-none cursor-pointer"
                    >
                      <option value="Shop Owner">Shop Owner</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Small Company">Small Company</option>
                      <option value="Online Seller">Online Seller</option>
                      <option value="Other">Other</option>
                    </motion.select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                </motion.div>

                {/* Taxpayer Category */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Taxpayer Category (For {year})</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <motion.select
                      name="taxpayerCategory"
                      value={financialProfile.taxpayerCategory}
                      onChange={handleFinancialChange}
                      whileFocus={{ scale: 1.02 }}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 appearance-none cursor-pointer"
                    >
                      <option value="general">General (Threshold: ৳3,50,000)</option>
                      <option value="female">Female Entrepreneur (Threshold: ৳4,00,000)</option>
                      <option value="senior_citizen">Senior Citizen (65+) (Threshold: ৳4,00,000)</option>
                      <option value="physically_challenged">Physically Challenged (Threshold: ৳4,75,000)</option>
                      <option value="freedom_fighter">Gazetted Freedom Fighter (Threshold: ৳5,00,000)</option>
                    </motion.select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">This determines your tax-free income limit</p>
                </motion.div>
                
                {/* Financial Year */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Financial Year</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={year}
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500">To change year, use the selector in the top menu.</p>
                </motion.div>
              </div>

              {/* Save Button */}
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </motion.div>
            </form>
          </StaggerContainer>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Profile;
