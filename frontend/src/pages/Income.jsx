import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useFinancialYear } from '../context/FinancialYearContext';
import { motion } from 'framer-motion';
import { Plus, Calendar, DollarSign, X, Trash2, TrendingUp } from 'lucide-react';
import { Card } from '../components/Card';
import { DataTable } from '../components/DataTable';
import { PageTransition } from '../components/Animations';
import Button from '../components/Button';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [naturalLanguageMode, setNaturalLanguageMode] = useState(false);
  const [formData, setFormData] = useState({ source: '', amount: '', date: '', description: '' });
  const [nlText, setNlText] = useState('');
  const [loading, setLoading] = useState(false);
  const { year } = useFinancialYear();

  useEffect(() => {
    fetchIncomes();
  }, [year]);

  const fetchIncomes = async () => {
    try {
      const { data } = await api.get('/income');
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
        await api.post('/income/ai', { text: nlText, financialYear: year });
      } else {
        await api.post('/income', { ...formData, financialYear: year });
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

  const handleDelete = async (idx) => {
    const id = incomes[idx]._id;
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/income/${id}`);
        fetchIncomes();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const tableRows = incomes.map((income) => [
    new Date(income.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    income.source,
    income.description || '-',
    <span key={income._id} className="text-secondary font-bold bg-secondary/10 px-3 py-1 rounded-full text-sm">
      +৳{income.amount.toLocaleString()}
    </span>
  ]);

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Income Management
          </h1>
          <p className="text-slate-500 text-sm mt-2">Track and manage your revenue sources</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
             <Button onClick={() => setShowModal(true)} icon={<Plus size={18} />}>
                Add Income
             </Button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <DataTable 
          headers={['Date', 'Source', 'Description', 'Amount']}
          rows={tableRows}
          onDelete={handleDelete}
          emptyMessage="No income records found"
          emptyIcon={DollarSign}
        />
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50">
              <h2 className="text-xl font-bold text-slate-800">Add Income</h2>
              <motion.button 
                whileHover={{ rotate: 90 }}
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                  <X size={24} />
              </motion.button>
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
                    <p className="text-xs text-slate-400 mt-2">✨ AI will automatically extract amount, date, and source.</p>
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
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
                    <Button 
                        type="submit" 
                        isLoading={loading}
                    >
                        Save Record
                    </Button>
                </div>
                </form>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </PageTransition>
  );
};

export default Income;
