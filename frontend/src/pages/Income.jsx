import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Mic, Search, Calendar, DollarSign, FileText, Trash2, X } from 'lucide-react';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [naturalLanguageMode, setNaturalLanguageMode] = useState(false);
  const [formData, setFormData] = useState({ source: '', amount: '', date: '', description: '' });
  const [nlText, setNlText] = useState('');
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState('2024-2025');

  useEffect(() => {
    fetchIncomes();
  }, [year]);

  const fetchIncomes = async () => {
    try {
      const { data } = await api.get(`/income?year=${year}`);
      setIncomes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (naturalLanguageMode) {
        await api.post('/income/ai', { text: nlText });
      } else {
        await api.post('/income', formData);
      }
      setShowModal(false);
      setFormData({ source: '', amount: '', date: '', description: '' });
      setNlText('');
      setNaturalLanguageMode(false);
      fetchIncomes();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding income');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/income/${id}`);
        fetchIncomes();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Income Management</h1>
          <p className="text-slate-500 text-sm">Track and manage your revenue sources</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
            <div className="relative">
                <select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                >
                    <option value="2024-2025">FY 2024-2025</option>
                    <option value="2023-2024">FY 2023-2024</option>
                    <option value="2022-2023">FY 2022-2023</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <Calendar size={16} />
                </div>
            </div>

            <button 
                onClick={() => setShowModal(true)}
                className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
                <Plus size={20} /> 
                <span className="font-medium">Add Income</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                <th className="p-5 font-semibold text-slate-600 text-sm">Date</th>
                <th className="p-5 font-semibold text-slate-600 text-sm">Source</th>
                <th className="p-5 font-semibold text-slate-600 text-sm">Description</th>
                <th className="p-5 font-semibold text-slate-600 text-sm text-right">Amount</th>
                <th className="p-5 font-semibold text-slate-600 text-sm text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {incomes.map((income) => (
                <tr key={income._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-5 text-slate-600 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(income.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </td>
                    <td className="p-5">
                        <span className="font-medium text-slate-800">{income.source}</span>
                    </td>
                    <td className="p-5 text-slate-500 text-sm max-w-xs truncate">{income.description || '-'}</td>
                    <td className="p-5 text-right">
                        <span className="text-secondary font-bold bg-secondary/10 px-3 py-1 rounded-full text-sm">
                            +৳{income.amount.toLocaleString()}
                        </span>
                    </td>
                    <td className="p-5 text-center">
                        <button 
                            onClick={() => handleDelete(income._id)} 
                            className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100"
                            title="Delete Record"
                        >
                            <Trash2 size={18} />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        {incomes.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <DollarSign size={32} className="text-slate-300" />
                </div>
                <p className="text-lg font-medium text-slate-600">No income records found</p>
                <p className="text-sm">Start by adding your first income entry</p>
            </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">Add Income</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
              </button>
            </div>

            <div className="p-6">
                <div className="mb-6 flex justify-end">
                    <button 
                        onClick={() => setNaturalLanguageMode(!naturalLanguageMode)} 
                        className={`text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                            naturalLanguageMode 
                                ? 'bg-indigo-100 text-indigo-700' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {naturalLanguageMode ? 'Switch to Manual Input' : 'Use AI for Text Input'}
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                {naturalLanguageMode ? (
                    <div className="mb-6">
                    <label className="block text-slate-700 font-medium mb-2">Describe your income</label>
                    <textarea
                        className="w-full border border-slate-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 leading-relaxed resize-none bg-slate-50 focus:bg-white transition-colors"
                        placeholder='e.g. "Received 50,000 taka from ABC Corp for consulting services today"'
                        rows="4"
                        value={nlText}
                        onChange={(e) => setNlText(e.target.value)}
                        required
                    ></textarea>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Mic size={12} /> AI will automatically extract amount, date, and source.
                    </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                                <input
                                type="text"
                                className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="e.g. Salary, Business"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (৳)</label>
                                <input
                                type="number"
                                className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input
                            type="date"
                            className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <input
                            type="text"
                            className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Optional details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                    <button 
                        type="button" 
                        onClick={() => setShowModal(false)} 
                        className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-light disabled:opacity-70 font-medium shadow-lg shadow-primary/20 transition-all transform active:scale-95"
                    >
                        {loading ? 'Processing...' : 'Save Record'}
                    </button>
                </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
