import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useFinancialYear } from '../context/FinancialYearContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { DollarSign, TrendingUp, TrendingDown, Activity, Lightbulb, Plus, MessageCircle, Zap, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [financialAnalysis, setFinancialAnalysis] = useState(null);
  const { year } = useFinancialYear();
  const [dataUpdated, setDataUpdated] = useState(false); // Track data changes

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if insights are already cached (we'll use cache for insights only,
        // but still fetch income/expense/tax every time so summary and charts update)
        const cached = sessionStorage.getItem(`insights-${year}`);
        let insightsRes;

        // Build requests: always fetch income/expenses/tax
        const incomePromise = api.get('/income');
        const expensePromise = api.get('/expenses');
        const taxPromise = api.get('/tax/calculate');

        if (cached) {
          // Use cached insights/analysis but still perform other requests
          const parsed = JSON.parse(cached);
          setInsights(parsed.insights);
          setFinancialAnalysis(parsed.analysis);
          insightsRes = { data: parsed };
        }

        // Only call AI endpoint if not cached
        const aiPromise = cached
          ? Promise.resolve(insightsRes)
          : api.get(`/ai/insights?year=${year}`).catch(err => ({ data: { insights: null, analysis: null } }));

        const [incomeRes, expenseRes, taxRes, aiRes] = await Promise.all([
          incomePromise,
          expensePromise,
          taxPromise,
          aiPromise,
        ]);

        // ensure insightsRes references the resolved ai response
        insightsRes = aiRes;

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

        // Cache insights+analysis if we got them from AI
        if (insightsRes?.data?.insights) {
          sessionStorage.setItem(`insights-${year}`, JSON.stringify(insightsRes.data));
          setInsights(insightsRes.data.insights);
        }

        if (insightsRes?.data?.analysis) {
          setFinancialAnalysis(insightsRes.data.analysis);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, dataUpdated]); // Re-fetch data when year or dataUpdated changes

  const handleDataUpdate = () => {
    sessionStorage.removeItem(`insights-${year}`); // Clear cached insights
    setDataUpdated(prev => !prev); // Trigger re-fetch
  };

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
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(6, 182, 212, 0.8)'
        ],
        borderColor: [
          '#10b981',
          '#ef4444',
          '#06b6d4'
        ],
        borderWidth: 2,
        borderRadius: 12,
      },
    ],
  };

  const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#e2e8f0',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(148, 163, 184, 0.2)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
          }
      },
      scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8' }
          },
          x: { 
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
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
            <h1 className="text-4xl font-bold gradient-text">
              Financial Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-2">Fiscal Year {year}</p>
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
            { label: 'Add Income', icon: Plus, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', path: '/income' },
            { label: 'Add Expense', icon: Plus, color: 'bg-red-500/10 text-red-400 border-red-500/20', path: '/expenses' },
            { label: 'View Tax', icon: Activity, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', path: '/tax' },
            { label: 'Chat AI', icon: MessageCircle, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', path: '/chat' },
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className={`flex items-center justify-center gap-2 p-4 glass-card border ${action.color} rounded-xl transition-all group`}
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
              <h3 className="text-lg font-semibold text-slate-100">Financial Overview</h3>
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                <Activity size={20} className="text-cyan-400" />
              </div>
            </div>
            <div className="h-80">
              {summary.totalIncome === 0 && summary.totalExpense === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                  <AlertCircle size={40} className="mb-3 opacity-40"/>
                  <p className="text-base font-medium">No financial data available</p>
                  <p className="text-sm mt-1 text-slate-500">Add income and expenses to see charts</p>
                </div>
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>
          </Card>

          {/* Summary Card */}
          <Card className="p-6" hover={false}>
            <h3 className="text-lg font-semibold text-slate-100 mb-6">Period Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <span className="text-sm text-slate-300">Income</span>
                <span className="font-semibold text-emerald-400 whitespace-nowrap">+৳{summary.totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <span className="text-sm text-slate-300">Expenses</span>
                <span className="font-semibold text-red-400 whitespace-nowrap">-৳{summary.totalExpense.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-700/50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Profit Margin</span>
                  <span className="text-lg font-bold text-slate-100">
                    {summary.totalIncome > 0
                      ? ((summary.profit / summary.totalIncome) * 100).toFixed(1)
                      : '0'}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Financial Health & Alerts Section */}
        {financialAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Financial Health Score Card */}
            <Card className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100">Financial Health</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  financialAnalysis.healthStatus === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  financialAnalysis.healthStatus === 'Good' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                  financialAnalysis.healthStatus === 'Fair' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {financialAnalysis.healthStatus}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="none" 
                      stroke="rgba(51, 65, 85, 0.5)" 
                      strokeWidth="10"
                    />
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="none" 
                      stroke={
                        financialAnalysis.financialHealthScore >= 80 ? '#10b981' :
                        financialAnalysis.financialHealthScore >= 65 ? '#06b6d4' :
                        financialAnalysis.financialHealthScore >= 50 ? '#f59e0b' :
                        '#ef4444'
                      } 
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - financialAnalysis.financialHealthScore / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-100">
                      {financialAnalysis.financialHealthScore}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm text-slate-300">
                    {financialAnalysis.healthExplanation}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Savings: {financialAnalysis.metrics.savingsRate}%</span>
                    <span>•</span>
                    <span>Emergency: {financialAnalysis.metrics.emergencyFundMonths} mo</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Smart Alerts Card */}
            <Card className="p-6 lg:col-span-2" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle size={20} className="text-amber-400" />
                <h3 className="text-lg font-semibold text-slate-100">Smart Alerts</h3>
              </div>
              <div className="space-y-3">
                {financialAnalysis.alerts && financialAnalysis.alerts.length > 0 ? (
                  financialAnalysis.alerts.map((alert, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border flex items-start gap-3 ${
                        alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                        alert.severity === 'high' ? 'bg-amber-500/10 border-amber-500/20' :
                        alert.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                        'bg-cyan-500/10 border-cyan-500/20'
                      }`}
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        alert.severity === 'critical' ? 'bg-red-500' :
                        alert.severity === 'high' ? 'bg-amber-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-cyan-500'
                      }`} />
                      <div>
                        <p className={`text-sm font-semibold ${
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'high' ? 'text-amber-400' :
                          alert.severity === 'medium' ? 'text-yellow-400' :
                          'text-cyan-400'
                        }`}>
                          {alert.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-center">
                    <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-emerald-400">No alerts</p>
                    <p className="text-xs text-slate-500 mt-1">Your finances look healthy!</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <Card className="p-8 border border-amber-500/20" hover={false}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                <Lightbulb size={24} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-3 text-slate-100">AI Financial Advisor</h3>
                {insights ? (
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {insights
                      .replace(/\*\*/g, '') // Remove bold
                      .replace(/###/g, '') // Remove h3
                      .replace(/##/g, '') // Remove h2
                      .replace(/#/g, '') // Remove h1
                      .replace(/`/g, '') // Remove code
                      .trim()}
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">
                    {summary.totalIncome === 0 ? 
                      <div>
                        <p className="font-medium mb-2 text-slate-200">Get Started with AI Insights</p>
                        <p className="text-slate-500 text-xs">Add your income and expenses to receive personalized financial advice and tax-saving recommendations.</p>
                      </div> :
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse w-2 h-2 bg-amber-400 rounded-full"></div>
                        <p>Analyzing your financial data...</p>
                      </div>
                    }
                  </div>
                )}
                <button 
                  onClick={() => navigate('/chat')}
                  className="mt-4 px-4 py-2 gradient-btn text-white rounded-lg text-sm font-semibold"
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