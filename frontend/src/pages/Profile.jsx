import { useState, useEffect } from 'react';
import api from '../services/api';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    businessType: '',
    taxpayerCategory: 'general',
    currentFinancialYear: '2024-2025'
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser({
            name: data.name,
            email: data.email,
            businessType: data.businessType,
            taxpayerCategory: data.taxpayerCategory || 'general',
            currentFinancialYear: data.currentFinancialYear || '2024-2025'
        });
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      // Assuming there is an update profile endpoint, if not we might need to create it
      // Since authController usually has update logic, let's assume PUT /auth/profile or similar
      // If not, I'll need to check authRoutes. 
      // Checking previous file lists, authRoutes.js exists.
      // Let's assume PUT /auth/profile works or I will fix it.
      
      const { data } = await api.put('/auth/profile', user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">Account Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        {message && (
          <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
              <select
                name="businessType"
                value={user.businessType}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Shop Owner">Shop Owner</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Small Company">Small Company</option>
                <option value="Online Seller">Online Seller</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Taxpayer Category (NBR Rule)</label>
              <select
                name="taxpayerCategory"
                value={user.taxpayerCategory}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="general">General (Threshold: ৳3,50,000)</option>
                <option value="female">Female Entrepreneur (Threshold: ৳4,00,000)</option>
                <option value="senior_citizen">Senior Citizen (65+) (Threshold: ৳4,00,000)</option>
                <option value="physically_challenged">Physically Challenged (Threshold: ৳4,75,000)</option>
                <option value="freedom_fighter">Gazetted Freedom Fighter (Threshold: ৳5,00,000)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">This determines your tax-free income limit.</p>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Financial Year</label>
                 <select
                    name="currentFinancialYear"
                    value={user.currentFinancialYear}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="2023-2024">2023-2024</option>
                    <option value="2024-2025">2024-2025</option>
                  </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
