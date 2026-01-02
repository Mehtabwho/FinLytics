import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useFinancialYear } from '../context/FinancialYearContext';
import { 
  User, Mail, Phone, Briefcase, Lock, 
  Camera, Eye, EyeOff, Save, X, ShieldCheck, 
  AlertCircle, CheckCircle, Calendar 
} from 'lucide-react';
import { PageTransition, StaggerContainer } from '../components/Animations';
import { Card } from '../components/Card';
import { SkeletonCard } from '../components/Skeleton';
import Button from '../components/Button';

const Profile = () => {
  const { year } = useFinancialYear();
  const { updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Form Data
  const [avatar, setAvatar] = useState(''); // Base64 or URL
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profession: 'Job Holder', // Default
  });
  const [financialInfo, setFinancialInfo] = useState({
    taxpayerCategory: 'general',
  });
  
  // Password Change State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, financialRes] = await Promise.all([
             api.get('/auth/profile'),
             api.get('/auth/financial-info')
        ]);

        const { name, email, avatar, phone, businessType } = profileRes.data;
        
        // Split name
        const nameParts = (name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setPersonalInfo({
            firstName,
            lastName,
            email: email || '',
            phone: phone || '',
            profession: businessType || 'Job Holder',
        });

        setAvatar(avatar || '');

        setFinancialInfo({
            taxpayerCategory: financialRes.data.taxpayerCategory || 'general',
        });

      } catch (error) {
        console.error("Failed to fetch profile", error);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  // Handlers
  const handlePersonalChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
         setMessage({ type: 'error', text: 'Only JPG and PNG formats are allowed' });
         return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setMessage({ type: 'error', text: 'Image size should be less than 10MB' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (showPasswordChange) {
      if (!passwords.current) return 'Current password is required to set a new one';
      if (passwords.new.length < 6) return 'New password must be at least 6 characters';
      if (passwords.new !== passwords.confirm) return 'New passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // 1. Update Global Profile (User Model)
      const updateData = {
        name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
        phone: personalInfo.phone,
        businessType: personalInfo.profession,
        avatar: avatar,
        // Only include password fields if changing
        ...(showPasswordChange && passwords.new ? {
            password: passwords.new,
            currentPassword: passwords.current
        } : {})
      };

      const res = await api.put('/auth/profile', updateData);
      updateUser(res.data); // Update global auth state

      // 2. Update Financial Info (Year Specific)
      await api.put('/auth/financial-info', {
          taxpayerCategory: financialInfo.taxpayerCategory,
          businessType: personalInfo.profession, // Sync business type
          financialYear: year
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Reset password fields
      if (showPasswordChange) {
        setPasswords({ current: '', new: '', confirm: '' });
        setShowPasswordChange(false);
      }
    } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    } finally {
        setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload page or reset state (simpler to just navigate or reload for now, but let's just clear message)
    setMessage(null);
    setShowPasswordChange(false);
    setPasswords({ current: '', new: '', confirm: '' });
    // Ideally revert changes, but simple cancel action usually just stops editing
  };

  if (loading) return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse" />
            <div className="space-y-2">
                <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* 1. Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="relative group">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer bg-slate-100 relative"
              onClick={handleAvatarClick}
            >
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User size={40} />
                </div>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg" 
              onChange={handleFileChange}
            />
          </div>

          <div className="text-center md:text-left space-y-1">
            <h1 className="text-2xl font-bold text-slate-800">
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
              <Mail size={14} /> {personalInfo.email}
            </p>
            <p className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full inline-block mt-1 font-semibold">
              {personalInfo.profession}
            </p>
          </div>
        </motion.div>

        {/* Message Toast */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-xl border flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="font-medium">{message.text}</span>
              <button onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-black/5 rounded-full">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <StaggerContainer delay={0.1}>
            
            {/* 2. Personal Information */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <Card className="overflow-visible">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <User size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={personalInfo.firstName}
                      onChange={handlePersonalChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="John"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={personalInfo.lastName}
                      onChange={handlePersonalChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Doe"
                    />
                  </div>

                  {/* Email (Read Only) */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                        <input
                        type="email"
                        value={personalInfo.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                        />
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Lock size={10} /> Email cannot be changed
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3.5 top-3 text-slate-400" size={18} />
                        <input
                        type="tel"
                        name="phone"
                        value={personalInfo.phone}
                        onChange={handlePersonalChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="+8801XXXXXXXXX"
                        />
                    </div>
                  </div>

                  {/* Profession */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Profession</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Job Holder', 'Businessman / Entrepreneur', 'Freelancer', 'Other'].map((option) => (
                            <label 
                                key={option}
                                className={`
                                    cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 transition-all
                                    ${personalInfo.profession === option 
                                        ? 'bg-primary/5 border-primary text-primary font-semibold shadow-sm' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}
                                `}
                            >
                                <input 
                                    type="radio" 
                                    name="profession" 
                                    value={option}
                                    checked={personalInfo.profession === option}
                                    onChange={handlePersonalChange}
                                    className="hidden"
                                />
                                <span className="text-sm">{option}</span>
                            </label>
                        ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 3. Security & Privacy */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <Card>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Security & Privacy</h2>
                        </div>
                    </div>

                    {!showPasswordChange ? (
                        <button 
                            type="button"
                            onClick={() => setShowPasswordChange(true)}
                            className="flex items-center gap-2 text-primary font-semibold hover:underline"
                        >
                            <Lock size={16} /> Change Password
                        </button>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-slate-700">Update Password</h3>
                                <button 
                                    type="button" 
                                    onClick={() => setShowPasswordChange(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        name="current"
                                        value={passwords.current}
                                        onChange={handlePasswordChange}
                                        placeholder="Current Password"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        name="new"
                                        value={passwords.new}
                                        onChange={handlePasswordChange}
                                        placeholder="New Password"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        name="confirm"
                                        value={passwords.confirm}
                                        onChange={handlePasswordChange}
                                        placeholder="Confirm New Password"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button 
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="text-sm text-slate-500 flex items-center gap-2 hover:text-slate-700"
                                    >
                                        {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                        {showPasswords ? 'Hide Passwords' : 'Show Passwords'}
                                    </button>
                                    <p className="text-xs text-slate-400">Min 6 characters</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </Card>
            </motion.div>

            {/* 4. Financial Year Info */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <Calendar size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Active Financial Year</p>
                            <h3 className="text-2xl font-bold text-white mb-2">{year}</h3>
                            <p className="text-slate-400 text-xs flex items-center gap-2">
                                <AlertCircle size={12} />
                                To change the financial year, use the selector in the sidebar menu.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* 5. Actions */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex justify-end gap-4 pt-4">
                <Button 
                    variant="secondary" 
                    type="button" 
                    onClick={handleCancel}
                    disabled={saving}
                >
                    Cancel
                </Button>
                <Button 
                    variant="primary" 
                    type="submit"
                    disabled={saving}
                    className="min-w-[150px] flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>Saving...</>
                    ) : (
                        <>
                            <Save size={18} /> Save Changes
                        </>
                    )}
                </Button>
            </motion.div>

          </StaggerContainer>
        </form>
      </div>
    </PageTransition>
  );
};

export default Profile;
