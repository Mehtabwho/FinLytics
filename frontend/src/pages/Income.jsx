import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useFinancialYear } from '../context/FinancialYearContext';
import { motion } from 'framer-motion';
import { Plus, Calendar, DollarSign, X, Trash2, TrendingUp, Search, Filter } from 'lucide-react';
import { Card } from '../components/Card';
import { DataTable } from '../components/DataTable';
import { PageTransition, StaggerContainer } from '../components/Animations';
import Button from '../components/Button';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [naturalLanguageMode, setNaturalLanguageMode] = useState(false);
  const [formData, setFormData] = useState({ source: '', amount: '', date: '', description: '' });
  const [nlText, setNlText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredIncomes = useMemo(() => {
    return incomes.filter(income => 
      income.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [incomes, searchTerm]);

  const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + item.amount, 0), [incomes]);
  const averageIncome = useMemo(() => incomes.length > 0 ? totalIncome / incomes.length : 0, [incomes, totalIncome]);

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
    // Original index logic might be wrong if filtered, so we should pass ID directly or find correct index
    // However, DataTable passes the index of the row being displayed.
    // If we pass filteredIncomes to DataTable, the index corresponds to filteredIncomes.
    // We need to find the actual item from filteredIncomes[idx]
    const itemToDelete = filteredIncomes[idx];
    if (!itemToDelete) return;

    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/income/${itemToDelete._id}`);
        fetchIncomes();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const tableRows = filteredIncomes.map((income) => [
    <span key={`date-${income._id}`} className="whitespace-nowrap font-medium text-slate-700">
      {new Date(income.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
    </span>,
    <div key={`source-${income._id}`} className="max-w-[150px] truncate font-medium text-slate-800" title={income.source}>
      {income.source}
    </div>,
    <div key={`desc-${income._id}`} className="max-w-[200px] truncate text-slate-500" title={income.description}>
      {income.description || '-'}
    </div>,
    <span key={income._id} className="text-secondary font-bold bg-secondary/10 px-3 py-1 rounded-full text-sm whitespace-nowrap">
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
          <h1 className="text-3xl font-bold text-slate-900">
            Income Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage your revenue sources</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
             <Button onClick={() => setShowModal(true)} icon={<Plus size={18} />}>
                Add Income
             </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <StaggerContainer delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Income</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">৳{totalIncome.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <DollarSign className="text-secondary" size={24} />
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Average Transaction</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">৳{averageIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <TrendingUp className="text-blue-500" size={24} />
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
             <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{incomes.length}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Calendar className="text-purple-500" size={24} />
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
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 w-full sm:w-96">
            <Search className="text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Search by source or description..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-slate-700 w-full placeholder:text-slate-400"
            />
        </div>

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
