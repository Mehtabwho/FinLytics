import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useFinancialYear } from '../context/FinancialYearContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Target, 
  Trash2, 
  Edit2, 
  Sparkles, 
  X, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  Wallet,
  Clock
} from 'lucide-react';
import { Card } from '../components/Card';
import { PageTransition, StaggerContainer } from '../components/Animations';
import Button from '../components/Button';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    targetAmount: '', 
    currentAmount: '', 
    category: 'Other' 
  });
  const [insights, setInsights] = useState({});
  const [insightsLoading, setInsightsLoading] = useState({});
  const { year } = useFinancialYear();

  useEffect(() => {
    fetchGoals();
  }, [year]);

  const fetchGoals = async () => {
    try {
      const { data } = await api.get(`/goals?financialYear=${year}`);
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const goalData = {
        ...formData,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount),
        id: editingGoal ? editingGoal._id : undefined
      };
      await api.post('/goals', { financialYear: year, goal: goalData });
      setShowModal(false);
      resetForm();
      fetchGoals();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await api.delete(`/goals/${id}?financialYear=${year}`);
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      category: goal.category || 'Other'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingGoal(null);
    setFormData({ name: '', targetAmount: '', currentAmount: '', category: 'Other' });
  };

  const fetchInsights = async (goalId) => {
    setInsightsLoading(prev => ({ ...prev, [goalId]: true }));
    try {
      const { data } = await api.get(`/goals/${goalId}/insights?financialYear=${year}`);
      setInsights(prev => ({ ...prev, [goalId]: data.insights }));
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights(prev => ({ ...prev, [goalId]: 'Could not generate insights at this time.' }));
    } finally {
      setInsightsLoading(prev => ({ ...prev, [goalId]: false }));
    }
  };

  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(Math.round(progress), 100);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Financial Goals</h1>
            <p className="text-slate-500 text-sm mt-1">Plan and track your financial milestones for {year}</p>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }} icon={<Plus size={18} />}>
            Add New Goal
          </Button>
        </motion.div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {goals.length > 0 ? (
              goals.map((goal) => {
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

                return (
                  <motion.div
                    key={goal._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-full flex flex-col border-l-4 border-l-primary relative overflow-hidden group">
                      {/* Actions */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(goal)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(goal._id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Target className="text-primary" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{goal.name}</h3>
                          <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full uppercase tracking-wider">
                            {goal.category}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 flex-grow">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-sm text-slate-500 font-medium">Progress</p>
                            <p className="text-2xl font-bold text-slate-900">{progress}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500 font-medium">Remaining</p>
                            <p className="text-lg font-semibold text-slate-700">৳{remaining.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              progress >= 100 ? 'bg-green-500' : 'bg-primary'
                            }`}
                          />
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Saved: ৳{goal.currentAmount.toLocaleString()}</span>
                          <span className="text-slate-400">Target: ৳{goal.targetAmount.toLocaleString()}</span>
                        </div>

                        {/* AI Insights Section */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                          {insights[goal._id] ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-blue-50/50 rounded-xl p-4 relative"
                            >
                              <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold text-sm">
                                <Sparkles size={16} />
                                <span>AI Recommendation</span>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed italic">
                                "{insights[goal._id]}"
                              </p>
                              <button 
                                onClick={() => fetchInsights(goal._id)}
                                className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Clock size={12} /> Refresh insight
                              </button>
                            </motion.div>
                          ) : (
                            <button
                              onClick={() => fetchInsights(goal._id)}
                              disabled={insightsLoading[goal._id]}
                              className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 text-sm font-medium"
                            >
                              {insightsLoading[goal._id] ? (
                                <>
                                  <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Sparkles size={18} />
                                  </motion.div>
                                  Analyzing financial data...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={18} />
                                  Get AI Insights & Suggestions
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="text-slate-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No goals set for {year}</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                  Start your financial journey by setting a goal. We'll help you track progress and provide AI-powered tips.
                </p>
                <Button 
                  onClick={() => setShowModal(true)} 
                  className="mt-6"
                  variant="outline"
                >
                  Create Your First Goal
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Goal Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Dream House, Emergency Fund"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Target (৳)</label>
                    <input
                      required
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Current (৳)</label>
                    <input
                      required
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="House">House</option>
                    <option value="Education">Education</option>
                    <option value="Business">Business</option>
                    <option value="Travel">Travel</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Savings">Savings</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      editingGoal ? 'Update Goal' : 'Create Goal'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Goals;
