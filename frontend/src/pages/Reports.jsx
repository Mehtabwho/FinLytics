import { useState, useEffect } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    income: [],
    expenses: [],
    tax: 0
  });
  const [year, setYear] = useState('2024-2025');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel fetching
        const [incomeRes, expenseRes, taxRes] = await Promise.all([
            api.get(`/income?year=${year}`),
            api.get(`/expenses?year=${year}`),
            api.get(`/tax/calculate?year=${year}`) // Assuming tax endpoint supports GET calculation
        ]);

        setFinancialData({
            income: incomeRes.data,
            expenses: expenseRes.data,
            tax: taxRes.data
        });
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  const processMonthlyData = () => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const incomeData = new Array(12).fill(0);
    const expenseData = new Array(12).fill(0);

    financialData.income.forEach(item => {
        const date = new Date(item.date);
        const month = date.getMonth(); // 0-11
        // Adjust for Jul-Jun fiscal year
        const fiscalIndex = month < 6 ? month + 6 : month - 6; 
        incomeData[fiscalIndex] += item.amount;
    });

    financialData.expenses.forEach(item => {
        const date = new Date(item.date);
        const month = date.getMonth();
        const fiscalIndex = month < 6 ? month + 6 : month - 6;
        expenseData[fiscalIndex] += item.amount;
    });

    return {
        labels: months,
        datasets: [
            {
                label: 'Income',
                data: incomeData,
                borderColor: '#10b981', // Green
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Expenses',
                data: expenseData,
                borderColor: '#ef4444', // Red
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };
  };

  const processExpenseCategories = () => {
    const categories = {};
    financialData.expenses.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + item.amount;
    });

    return {
        labels: Object.keys(categories),
        datasets: [{
            data: Object.values(categories),
            backgroundColor: [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'
            ]
        }]
    };
  };

  const totalIncome = financialData.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = financialData.expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpense;
  
  const handleDownload = () => {
      const csvContent = "data:text/csv;charset=utf-8," 
          + "Type,Date,Amount,Description\n"
          + financialData.income.map(i => `Income,${i.date.split('T')[0]},${i.amount},"${i.source}"`).join("\n") + "\n"
          + financialData.expenses.map(e => `Expense,${e.date.split('T')[0]},${e.amount},"${e.category} - ${e.description}"`).join("\n");
          
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `finlytics_report_${year}.csv`);
      document.body.appendChild(link);
      link.click();
  };

    const handleDownloadPDF = () => {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 40;

      doc.setFontSize(18);
      doc.text(`FinLytics Annual Report - ${year}`, pageWidth / 2, y, { align: 'center' });
      y += 30;

      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
      y += 20;

      // Summary
      doc.setFontSize(12);
      const totalIncomeText = `Total Income: ৳${totalIncome.toLocaleString()}`;
      const totalExpenseText = `Total Expense: ৳${totalExpense.toLocaleString()}`;
      const netProfitText = `Net Profit: ৳${netProfit.toLocaleString()}`;

      doc.text(totalIncomeText, margin, y);
      doc.text(totalExpenseText, margin + 220, y);
      doc.text(netProfitText, margin + 440, y);
      y += 30;

      // Prepare table rows
      const rows = [];
      financialData.income.forEach(i => {
        rows.push(['Income', i.date.split('T')[0], `৳${i.amount.toLocaleString()}`, i.source || '-']);
      });
      financialData.expenses.forEach(e => {
        rows.push(['Expense', e.date.split('T')[0], `৳${e.amount.toLocaleString()}`, `${e.category || '-'} - ${e.description || '-'}`]);
      });

      // Auto-table for items
      doc.autoTable({
        head: [['Type', 'Date', 'Amount', 'Description']],
        body: rows,
        startY: y,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [60, 60, 60] }
      });

      doc.save(`finlytics_report_${year}.pdf`);
    };

  if (loading) return <div className="p-8 text-center text-slate-500">Generating Financial Reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Annual Financial Report</h1>
        <div className="flex space-x-3">
             <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
             >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
             </select>
            <button 
              onClick={handleDownloadPDF}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light flex items-center gap-2 text-sm"
            >
              <span>Download PDF</span>
            </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500">Total Income</p>
            <p className="text-2xl font-bold text-primary mt-1">৳{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500">Total Expense</p>
            <p className="text-2xl font-bold text-red-500 mt-1">৳{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500">Net Profit</p>
            <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ৳{netProfit.toLocaleString()}
            </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500">Estimated Tax</p>
            <p className="text-2xl font-bold text-slate-700 mt-1">৳{(financialData.tax.taxPayable || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-700 mb-4">Financial Trends (Jul - Jun)</h3>
            <div className="h-64">
                <Line options={{ maintainAspectRatio: false, responsive: true }} data={processMonthlyData()} />
            </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-700 mb-4">Expense Distribution</h3>
            <div className="h-64 flex justify-center">
                <Pie options={{ maintainAspectRatio: false, responsive: true }} data={processExpenseCategories()} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
