import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Plus, Calendar, Trash2, X, Receipt, Tag } from 'lucide-react';
import { Card } from '../components/Card';
import { DataTable } from '../components/DataTable';
import { PageTransition } from '../components/Animations';
import Button from '../components/Button';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [naturalLanguageMode, setNaturalLanguageMode] = useState(false);
  const [formData, setFormData] = useState({ category: '', amount: '', date: '', description: '', isDeductible: true });
  const [nlText, setNlText] = useState('');
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState('2024-2025');

  useEffect(() => {
    fetchExpenses();
  }, [year]);

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get(`/expenses?year=${year}`);
      setExpenses(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (naturalLanguageMode) {
        await api.post('/expenses/ai', { text: nlText });
      } else {
        await api.post('/expenses', formData);
      }
      setShowModal(false);
      setFormData({ category: '', amount: '', date: '', description: '', isDeductible: true });
      setNlText('');
      setNaturalLanguageMode(false);
      fetchExpenses();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (idx) => {
    const id = expenses[idx]._id;
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const tableRows = expenses.map((expense) => [
    new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    <span key={expense._id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
      <Tag size={12} />
      {expense.category}
    </span>,
    expense.description || '-',
    <span key={`deductible-${expense._id}`} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      expense.isDeductible 
        ? 'bg-green-100 text-green-700' 
        : 'bg-slate-100 text-slate-500'
    }`}>
      {expense.isDeductible ? 'Yes' : 'No'}
    </span>,
    <span key={`amount-${expense._id}`} className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full text-sm">
      -৳{expense.amount.toLocaleString()}
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
            Expense Management
          </h1>
          <p className="text-slate-500 text-sm mt-2">Track spending and optimize tax deductions</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
            <div className="relative">
                <select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm font-medium"
                >
                    <option value="2024-2025">FY 2024-2025</option>
                    <option value="2023-2024">FY 2023-2024</option>
                    <option value="2022-2023">FY 2022-2023</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <Calendar size={16} />
                </div>
            </div>

            <Button 
                onClick={() => setShowModal(true)}
                variant="danger"
                className="flex items-center gap-2"
            >
                <Plus size={20} /> 
                <span>Add Expense</span>
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
          headers={['Date', 'Category', 'Description', 'Deductible', 'Amount']}
          rows={tableRows}
          onDelete={handleDelete}
          emptyMessage="No expenses found"
          emptyIcon={Receipt}
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
              <h2 className="text-xl font-bold text-slate-800">Add Expense</h2>
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
                    <label className="block text-slate-700 font-medium mb-2">Describe your expense</label>
                    <textarea
                        className="w-full border border-slate-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 leading-relaxed resize-none bg-slate-50 focus:bg-white transition-colors"
                        placeholder='e.g. "Paid 20,000 taka for office rent yesterday"'
                        rows="4"
                        value={nlText}
                        onChange={(e) => setNlText(e.target.value)}
                        required
                    ></textarea>
                    <p className="text-xs text-slate-400 mt-2">✨ AI will automatically extract amount, date, and category.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <input
                                type="text"
                                className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="e.g. Rent, Utilities"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                                <p className="text-xs text-slate-400 mt-1">Leave empty for AI suggestion</p>
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

                        <div className="pt-2">
                             <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isDeductible} 
                                    onChange={(e) => setFormData({...formData, isDeductible: e.target.checked})}
                                    className="w-5 h-5 text-primary rounded focus:ring-primary/50 border-gray-300"
                                />
                                <div>
                                    <span className="block text-sm font-medium text-slate-700">Tax Deductible</span>
                                    <span className="block text-xs text-slate-500">This expense reduces your taxable income</span>
                                </div>
                            </label>
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
                        variant="danger"
                    >
                        Save Expense
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

export default Expenses;
