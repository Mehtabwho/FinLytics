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
            <h1 className="text-3xl font-bold gradient-text">Financial Goals</h1>
            <p className="text-slate-400 text-sm mt-1">Plan and track your financial milestones for {year}</p>
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
                    <Card className="h-full flex flex-col border-l-4 border-l-cyan-500 relative overflow-hidden group">
                      {/* Actions */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(goal)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(goal._id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                          <Target className="text-cyan-400" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-100">{goal.name}</h3>
                          <span className="text-xs font-medium px-2 py-0.5 bg-slate-700/70 text-slate-300 rounded-full uppercase tracking-wider border border-slate-600">
                            {goal.category}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 flex-grow">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-sm text-slate-400 font-medium">Progress</p>
                            <p className="text-2xl font-bold text-slate-100">{progress}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-400 font-medium">Remaining</p>
                            <p className="text-lg font-semibold text-slate-300">৳{remaining.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-slate-700/70 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              progress >= 100 ? 'bg-emerald-500' : 'bg-cyan-500'
                            }`}
                          />
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Saved: ৳{goal.currentAmount.toLocaleString()}</span>
                          <span className="text-slate-500">Target: ৳{goal.targetAmount.toLocaleString()}</span>
                        </div>

                        {/* AI Insights Section */}
                        <div className="mt-6 pt-6 border-t border-slate-700/50">
                          {insights[goal._id] ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-cyan-500/10 rounded-xl p-4 relative border border-cyan-500/20"
                            >
                              <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold text-sm">
                                <Sparkles size={16} />
                                <span>AI Recommendation</span>
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed italic">
                                "{insights[goal._id]}"
                              </p>
                              <button 
                                onClick={() => fetchInsights(goal._id)}
                                className="mt-2 text-xs text-cyan-400 hover:underline flex items-center gap-1"
                              >
                                <Clock size={12} /> Refresh insight
                              </button>
                            </motion.div>
                          ) : (
                            <button
                              onClick={() => fetchInsights(goal._id)}
                              disabled={insightsLoading[goal._id]}
                              className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition-all flex items-center justify-center gap-2 text-sm font-medium"
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
              <div className="col-span-full py-20 text-center glass-card rounded-3xl border border-dashed border-slate-700">
                <div className="mx-auto w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="text-slate-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-100">No goals set for {year}</h3>
                <p className="text-slate-400 mt-2 max-w-sm mx-auto">
                  Start your financial journey by setting a goal. We'll help you track progress and provide AI-powered tips.
                </p>
                <Button 
                  onClick={() => setShowModal(true)} 
                  className="mt-6"
                  variant="primary"
                >
                  Create Your First Goal
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="glass-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-100">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Goal Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Dream House, Emergency Fund"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-slate-100"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-300">Target (৳)</label>
                    <input
                      required
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-slate-100"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-300">Current (৳)</label>
                    <input
                      required
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-slate-100"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Category</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-slate-100"
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
                    className="flex-1 py-3 rounded-xl font-semibold text-slate-400 bg-slate-700 hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-semibold text-white gradient-btn transition-all flex items-center justify-center gap-2"
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