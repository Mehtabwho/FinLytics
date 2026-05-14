import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useFinancialYear } from '../context/FinancialYearContext';
import { motion } from 'framer-motion';
import { Plus, Calendar, Trash2, X, Receipt, Tag, Search, TrendingDown, DollarSign, Upload } from 'lucide-react';
import { Card } from '../components/Card';
import { DataTable } from '../components/DataTable';
import { PageTransition, StaggerContainer } from '../components/Animations';
import Button from '../components/Button';
import DocumentUploadModal from '../components/DocumentUploadModal';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [naturalLanguageMode, setNaturalLanguageMode] = useState(false);
  const [formData, setFormData] = useState({ category: '', amount: '', date: '', description: '', isDeductible: true });
  const [nlText, setNlText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { year } = useFinancialYear();

  useEffect(() => {
    fetchExpenses();
  }, [year]);

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => 
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, searchTerm]);

  const totalExpense = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
  const deductibleExpense = useMemo(() => expenses.filter(e => e.isDeductible).reduce((sum, item) => sum + item.amount, 0), [expenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (naturalLanguageMode) {
        await api.post('/expenses/ai', { text: nlText, financialYear: year });
      } else {
        await api.post('/expenses', { ...formData, financialYear: year });
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
    const itemToDelete = filteredExpenses[idx];
    if (!itemToDelete) return;

    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${itemToDelete._id}`);
        fetchExpenses();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const tableRows = filteredExpenses.map((expense) => [
    <span key={`date-${expense._id}`} className="whitespace-nowrap font-medium text-slate-300">
      {new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
    </span>,
    <span key={expense._id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/50 text-slate-200 text-xs font-medium whitespace-nowrap border border-slate-600/30">
      <Tag size={12} />
      {expense.category}
    </span>,
    <div key={`desc-${expense._id}`} className="max-w-[200px] truncate text-slate-400" title={expense.description}>
      {expense.description || '-'}
    </div>,
    <span key={`deductible-${expense._id}`} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${
      expense.isDeductible 
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
        : 'bg-slate-700/50 text-slate-400 border-slate-600/30'
    }`}>
      {expense.isDeductible ? 'Yes' : 'No'}
    </span>,
    <span key={`amount-${expense._id}`} className="text-red-400 font-bold bg-red-500/10 px-3 py-1 rounded-full text-sm whitespace-nowrap border border-red-500/20">
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
          <h1 className="text-3xl font-bold gradient-text">
            Expense Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Track spending and optimize tax deductions</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
            <Button 
                onClick={() => setShowOCRModal(true)}
                variant="secondary"
                className="flex items-center gap-2"
            >
                <Upload size={18} />
                Upload Receipt
            </Button>
            <Button 
                onClick={() => setShowModal(true)}
                variant="danger"
                className="flex items-center gap-2"
            >
                <Plus size={18} /> 
                Add Expense
            </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <StaggerContainer delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Total Expenses</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">৳{totalExpense.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <TrendingDown className="text-red-400" size={24} />
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Deductible Expenses</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">৳{deductibleExpense.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <DollarSign className="text-emerald-400" size={24} />
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
             <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">{expenses.length}</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Calendar className="text-purple-400" size={24} />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </StaggerContainer>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-xl border border-slate-700 w-full sm:w-96">
            <Search className="text-slate-500" size={20} />
            <input 
                type="text" 
                placeholder="Search by category or description..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-slate-200 w-full placeholder:text-slate-500"
            />
        </div>

        <DataTable 
          headers={['Date', 'Category', 'Description', 'Deductible', 'Amount']}
          rows={tableRows}
          onDelete={handleDelete}
          emptyMessage="No expenses found"
          emptyIcon={Receipt}
        />
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Plus className="text-red-400" />
                {naturalLanguageMode ? 'AI Smart Entry' : 'Manual Entry'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="flex gap-2 p-1 bg-slate-700/70 rounded-xl mb-4">
                <button 
                  type="button"
                  onClick={() => setNaturalLanguageMode(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!naturalLanguageMode ? 'bg-slate-600 shadow-sm text-cyan-400' : 'text-slate-400'}`}
                >
                  Manual
                </button>
                <button 
                  type="button"
                  onClick={() => setNaturalLanguageMode(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${naturalLanguageMode ? 'bg-slate-600 shadow-sm text-cyan-400' : 'text-slate-400'}`}
                >
                  AI Voice/Text
                </button>
              </div>

              {naturalLanguageMode ? (
                <div className="space-y-4">
                   <label className="block text-sm font-medium text-slate-300 mb-1">Tell us about your expense</label>
                   <textarea
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100 placeholder:text-slate-500"
                    placeholder="e.g. Spent 500 on transport today"
                    rows="4"
                    value={nlText}
                    onChange={(e) => setNlText(e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <TrendingDown size={12} /> AI will automatically extract amount, date, and category.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100"
                      placeholder="e.g. Rent, Marketing, Inventory"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Amount (৳)</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-100"
                      placeholder="Add more details..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDeductible"
                      checked={formData.isDeductible}
                      onChange={(e) => setFormData({ ...formData, isDeductible: e.target.checked })}
                      className="w-4 h-4 text-cyan-500 focus:ring-cyan-500 border-slate-600 rounded bg-slate-800"
                    />
                    <label htmlFor="isDeductible" className="text-sm text-slate-400">This expense is tax deductible</label>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="danger"
                  className="flex-1" 
                  isLoading={loading}
                >
                  Save Entry
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <DocumentUploadModal 
        isOpen={showOCRModal} 
        onClose={() => setShowOCRModal(false)} 
        onSuccess={fetchExpenses}
      />
    </div>
    </PageTransition>
  );
};

export default Expenses;