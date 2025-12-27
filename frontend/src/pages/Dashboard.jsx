import { useEffect, useState } from 'react';
import api from '../services/api'; // Correct import path
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { DollarSign, TrendingUp, TrendingDown, Activity, Lightbulb, AlertCircle, Plus, MessageCircle } from 'lucide-react';

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
  const [year, setYear] = useState('2024-2025');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel fetching for speed
        const [incomeRes, expenseRes, taxRes, insightsRes] = await Promise.all([
             api.get(`/income?year=${year}`),
             api.get(`/expenses?year=${year}`),
             api.get(`/tax/calculate?year=${year}`),
             api.get(`/ai/insights?year=${year}`).catch(err => ({ data: { insights: null } })) // Handle AI failure gracefully
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

  if (loading) return (
      <div className="flex h-64 items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-slate-200 rounded"></div>
              <p className="mt-4 text-slate-500">Analyzing financial data...</p>
          </div>
      </div>
  );

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Financial Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Fiscal Year {year}</p>
        </div>
        <select 
          value={year} 
          onChange={(e) => setYear(e.target.value)}
          className="border border-slate-200 p-2.5 rounded-xl bg-white shadow-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="2024-2025">2024-2025</option>
          <option value="2023-2024">2023-2024</option>
        </select>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/income')}
          className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} className="text-green-600" />
          <span className="text-sm font-semibold text-green-700">Add Income</span>
        </button>
        <button
          onClick={() => navigate('/expenses')}
          className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} className="text-red-600" />
          <span className="text-sm font-semibold text-red-700">Add Expense</span>
        </button>
        <button
          onClick={() => navigate('/tax')}
          className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Activity size={20} className="text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">View Tax</span>
        </button>
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <MessageCircle size={20} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">Chat AI</span>
        </button>
      </div>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Income</p>
          <h3 className="text-2xl font-bold text-primary mt-1">৳{summary.totalIncome.toLocaleString()}</h3>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-500">
              <TrendingDown size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Expenses</p>
          <h3 className="text-2xl font-bold text-primary mt-1">৳{summary.totalExpense.toLocaleString()}</h3>
        </div>

        {/* Profit Card (Smart State) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${summary.profit >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'}`}>
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Net Profit</p>
          <h3 className={`text-2xl font-bold mt-1 ${summary.profit >= 0 ? 'text-primary' : 'text-red-500'}`}>
            ৳{summary.profit.toLocaleString()}
          </h3>
        </div>

        {/* Tax Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <Activity size={24} />
            </div>
            <span className="text-xs text-slate-400">NBR Rules</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Estimated Tax</p>
          <h3 className="text-2xl font-bold text-primary mt-1">৳{summary.estimatedTax.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-2">Tax Free Limit: ৳{(summary.taxFreeLimit || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-6">
          {/* Chart Section */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-8">Financial Overview</h3>
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
          </div>

          {/* AI Insights Section */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5">
                <Lightbulb size={200} strokeWidth={0.5} />
            </div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-yellow-400/20 rounded-lg backdrop-blur-sm">
                    <Lightbulb size={24} className="text-yellow-300" />
                </div>
                <h3 className="text-xl font-bold">AI Financial Advisor</h3>
            </div>

            <div className="space-y-4 relative z-10">
                {insights ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                         {/* Simple parsing to display text cleanly */}
                        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                            {insights.replace(/\*\*/g, '').replace(/###/g, '')}
                        </p>
                    </div>
                ) : (
                    <div className="text-slate-300 text-sm">
                        {summary.totalIncome === 0 ? 
                            <div>
                              <p className="font-medium mb-2">Get Started with AI Insights</p>
                              <p className="text-slate-400 text-xs">Add your income and expenses to receive personalized financial advice and tax-saving recommendations.</p>
                            </div> :
                            <div className="flex items-center gap-2">
                              <div className="animate-pulse w-2 h-2 bg-yellow-300 rounded-full"></div>
                              <p>Analyzing your financial data...</p>
                            </div>
                        }
                    </div>
                )}
            </div>
            
            <button 
              onClick={() => navigate('/chat')}
              className="mt-6 w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-lg text-sm font-semibold transition-colors duration-200"
            >
                Chat with AI Assistant
            </button>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
