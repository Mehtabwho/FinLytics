import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useFinancialYear } from '../context/FinancialYearContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { FileText, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { PageTransition, StaggerContainer } from '../components/Animations';
import { Card } from '../components/Card';
import { SkeletonCard } from '../components/Skeleton';
import Button from '../components/Button';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    income: [],
    expenses: [],
    tax: 0
  });
  const { year } = useFinancialYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel fetching
        const [incomeRes, expenseRes, taxRes] = await Promise.all([
            api.get('/income'),
            api.get('/expenses'),
            api.get('/tax/calculate') // Assuming tax endpoint supports GET calculation
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

      // Summary - Using a better table layout for clarity
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Financial Summary', margin, y);
      y += 20;
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      const summaryData = [
        ['Total Income:', `${totalIncome.toLocaleString()} Taka`],
        ['Total Expense:', `${totalExpense.toLocaleString()} Taka`],
        ['Net Profit:', `${netProfit.toLocaleString()} Taka`]
      ];
      
      doc.autoTable({
        body: summaryData,
        startY: y,
        margin: { left: margin, right: margin },
        styles: { fontSize: 11, cellPadding: 5 },
        columnStyles: {
          0: { cellWidth: 80, fontStyle: 'bold' },
          1: { cellWidth: 100, halign: 'right' }
        },
        didDrawPage: function() {}
      });
      
      y = doc.lastAutoTable.finalY + 20;

      // Prepare table rows
      const rows = [];
      financialData.income.forEach(i => {
        rows.push(['Income', i.date.split('T')[0], `${i.amount.toLocaleString()} Taka`, i.source || '-']);
      });
      financialData.expenses.forEach(e => {
        rows.push(['Expense', e.date.split('T')[0], `${e.amount.toLocaleString()} Taka`, `${e.category || '-'} - ${e.description || '-'}`]);
      });

      // Add a page break if needed and add detailed transactions table
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Detailed Transactions', margin, y);
      y += 15;
      
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

  if (loading) return (
    <PageTransition>
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <SkeletonCard key={i} height="h-96" />)}
        </div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary to-primary-light rounded-xl shadow-lg">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Annual Reports
            </h1>
            <p className="text-sm text-slate-500">Comprehensive financial overview & trends</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download size={16} />
            <span>Download PDF</span>
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <StaggerContainer delay={0.06}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Income</p>
                  <p className="text-3xl font-bold text-secondary mt-2">৳{totalIncome.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <TrendingUp className="text-secondary" size={24} />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Expense</p>
                  <p className="text-3xl font-bold text-red-500 mt-2">৳{totalExpense.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <TrendingDown className="text-red-500" size={24} />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Net Profit</p>
                  <p className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ৳{netProfit.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {netProfit >= 0 ? <TrendingUp className="text-green-500" size={24} /> : <TrendingDown className="text-red-500" size={24} />}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-secondary/5 border-secondary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Estimated Tax</p>
                  <p className="text-3xl font-bold text-primary mt-2">৳{(financialData.tax.taxPayable || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Calendar className="text-primary" size={24} />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-secondary" size={20} />
              <h3 className="font-bold text-slate-800">Financial Trends (Jul - Jun)</h3>
            </div>
            <div className="h-64">
              <Line options={{ maintainAspectRatio: false, responsive: true }} data={processMonthlyData()} />
            </div>
          </Card>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="text-red-500" size={20} />
              <h3 className="font-bold text-slate-800">Expense Distribution</h3>
            </div>
            <div className="h-64 flex justify-center">
              <Pie options={{ maintainAspectRatio: false, responsive: true }} data={processExpenseCategories()} />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Reports;
