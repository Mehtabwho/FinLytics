import { useEffect, useState } from 'react';
import api from '../services/api';
import { useFinancialYear } from '../context/FinancialYearContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { DollarSign, TrendingUp, TrendingDown, Activity, Lightbulb, AlertCircle, Plus, MessageCircle, Zap } from 'lucide-react';
import { Card, StatCard } from '../components/Card';
import { SkeletonCard } from '../components/Skeleton';
import { PageTransition, StaggerContainer } from '../components/Animations';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    profit: 0,
    estimatedTax: 0,
    taxFreeLimit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const { year } = useFinancialYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel fetching for speed
        const [incomeRes, expenseRes, taxRes, insightsRes] = await Promise.all([
             api.get('/income'),
             api.get('/expenses'),
             api.get('/tax/calculate'),
             api.get('/ai/insights').catch(err => ({ data: { insights: null } })) // Handle AI failure gracefully
        ]);

        const incomes = incomeRes.data;
        const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);

        const expenses = expenseRes.data;
        const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

        const taxData = taxRes.data;

        setSummary({
          totalIncome,
          totalExpense,
          profit: totalIncome - totalExpense,
          estimatedTax: taxData.taxPayable,
          taxFreeLimit: taxData.taxFreeThreshold,
        });

        setInsights(insightsRes.data.insights);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <SkeletonCard />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  const chartData = {
    labels: ['Income', 'Expenses', 'Profit'],
    datasets: [
      {
        label: 'Financial Overview',
        data: [summary.totalIncome, summary.totalExpense, summary.profit],
        backgroundColor: ['#10B981', '#EF4444', '#0f172a'],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: { display: false },
      },
      scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
      }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Financial Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-2">Fiscal Year {year}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="border border-slate-200 p-2.5 rounded-xl bg-white shadow-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="2024-2025">FY 2024-2025</option>
              <option value="2023-2024">FY 2023-2024</option>
            </select>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { label: 'Add Income', icon: Plus, color: 'bg-green-50 text-green-600 border-green-200', path: '/income' },
            { label: 'Add Expense', icon: Plus, color: 'bg-red-50 text-red-600 border-red-200', path: '/expenses' },
            { label: 'View Tax', icon: Activity, color: 'bg-purple-50 text-purple-600 border-purple-200', path: '/tax' },
            { label: 'Chat AI', icon: MessageCircle, color: 'bg-blue-50 text-blue-600 border-blue-200', path: '/chat' },
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className={`flex items-center justify-center gap-2 p-4 ${action.color} border rounded-xl transition-all shadow-sm hover:shadow-md group`}
              >
                <Icon size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-semibold">{action.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Key Metrics */}
        <StaggerContainer delay={0.08}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <StatCard
                label="Total Income"
                value={`৳${summary.totalIncome.toLocaleString()}`}
                icon={TrendingUp}
                color="secondary"
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <StatCard
                label="Total Expenses"
                value={`৳${summary.totalExpense.toLocaleString()}`}
                icon={TrendingDown}
                color="red"
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <StatCard
                label="Net Profit"
                value={`৳${summary.profit.toLocaleString()}`}
                icon={DollarSign}
                color={summary.profit >= 0 ? 'secondary' : 'red'}
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <StatCard
                label="Estimated Tax"
                value={`৳${summary.estimatedTax.toLocaleString()}`}
                icon={Zap}
                color="amber"
              />
            </motion.div>
          </div>
        </StaggerContainer>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Bar Chart */}
          <Card className="lg:col-span-2 p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Financial Overview</h3>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="h-80">
              {summary.totalIncome === 0 && summary.totalExpense === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <AlertCircle size={40} className="mb-3 opacity-40"/>
                  <p className="text-base font-medium">No financial data available</p>
                  <p className="text-sm mt-1">Add income and expenses to see charts</p>
                </div>
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>
          </Card>

          {/* Summary Card */}
          <Card className="p-6" hover={false}>
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Period Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-slate-600">Income</span>
                <span className="font-semibold text-green-600">+৳{(summary.totalIncome / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-slate-600">Expenses</span>
                <span className="font-semibold text-red-600">-৳{(summary.totalExpense / 1000000).toFixed(1)}M</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Profit Margin</span>
                  <span className="text-lg font-bold text-slate-900">
                    {summary.totalIncome > 0
                      ? ((summary.profit / summary.totalIncome) * 100).toFixed(1)
                      : '0'}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 border-0" hover={false}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur">
                <Lightbulb size={24} className="text-amber-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-3">AI Financial Advisor</h3>
                {insights ? (
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {insights.replace(/\*\*/g, '').replace(/###/g, '')}
                  </p>
                ) : (
                  <div className="text-slate-300 text-sm">
                    {summary.totalIncome === 0 ? 
                      <div>
                        <p className="font-medium mb-2">Get Started with AI Insights</p>
                        <p className="text-slate-400 text-xs">Add your income and expenses to receive personalized financial advice and tax-saving recommendations.</p>
                      </div> :
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse w-2 h-2 bg-amber-300 rounded-full"></div>
                        <p>Analyzing your financial data...</p>
                      </div>
                    }
                  </div>
                )}
                <button 
                  onClick={() => navigate('/chat')}
                  className="mt-4 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg text-sm font-semibold transition-colors"
                >
                  Chat with AI
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
