import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { FileText, Info, Calculator, ShieldCheck, AlertCircle, Download, RefreshCw, TrendingUp } from 'lucide-react';
import { Card } from '../components/Card';
import { SkeletonCard } from '../components/Skeleton';
import { PageTransition, StaggerContainer } from '../components/Animations';
import Button from '../components/Button';

const Tax = () => {
  const [taxData, setTaxData] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [year, setYear] = useState('2024-2025');

  useEffect(() => {
    fetchTaxData();
  }, [year]);

  const fetchTaxData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tax/calculate?year=${year}`);
      setTaxData(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getExplanation = async () => {
    if (!taxData) return;
    setExplaining(true);
    try {
        const { data } = await api.post('/tax/explain', { taxData });
        setExplanation(data.explanation);
    } catch (error) {
        console.error(error);
    } finally {
        setExplaining(false);
    }
  }

  if (loading) return (
    <PageTransition>
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShieldCheck className="text-primary" size={28} />
              </div>
              Tax Manager
            </h1>
            <p className="text-slate-500 text-sm mt-2">Automated NBR-compliant tax calculation & insights</p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex gap-3"
          >
            <div className="relative">
              <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm font-medium"
              >
                <option value="2024-2025">FY 2024-2025</option>
                <option value="2023-2024">FY 2023-2024</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <Calculator size={16} />
              </div>
            </div>
            <Button
              onClick={fetchTaxData}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw size={18} />
              <span>Recalculate</span>
            </Button>
          </motion.div>
        </motion.div>

        {taxData && (
          <StaggerContainer delay={0.08}>
            {/* Left Column: Summary & Breakdown */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="lg:col-span-2 space-y-6">
                {/* Main Summary Card */}
                <Card className="relative overflow-hidden p-6" hover={false}>
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Calculator size={120} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-6">
                            <div>
                                <p className="text-slate-500 text-sm mb-1">Taxpayer Category</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium capitalize text-sm">
                                    {taxData.taxpayerCategory.replace(/_/g, ' ')}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Total Income</p>
                                    <p className="font-bold text-slate-800 text-lg">৳{taxData.totalIncome.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Deductible Exp.</p>
                                    <p className="font-bold text-red-500 text-lg">-৳{taxData.totalDeductibleExpenses.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-600 font-medium">Taxable Income</span>
                                <span className="text-slate-900 font-bold">৳{taxData.taxableIncome.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-px bg-slate-200 my-3"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-primary font-bold text-lg">Net Tax Payable</span>
                                <span className="text-primary font-bold text-2xl">৳{taxData.taxPayable.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Breakdown Table */}
                <Card className="overflow-hidden" hover={false}>
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <FileText size={18} className="text-slate-400" /> 
                            Calculation Breakdown (Slab-wise)
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="p-4 font-medium">Income Slab</th>
                                    <th className="p-4 font-medium">Chargeable Amount</th>
                                    <th className="p-4 font-medium">Tax Rate</th>
                                    <th className="p-4 font-medium text-right">Tax Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {taxData.breakdown.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-medium text-slate-700">{item.slab}</td>
                                        <td className="p-4 text-slate-600">৳{item.amount.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">
                                                {(item.rate * 100)}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono font-medium text-slate-700">
                                            ৳{item.tax.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50/80 font-bold text-slate-800">
                                <tr>
                                    <td colSpan="3" className="p-4 text-right">Total Tax</td>
                                    <td className="p-4 text-right">৳{taxData.taxPayable.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>
            </motion.div>

            {/* Right Column: AI Insights */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-6">
                <Card className="bg-gradient-to-br from-primary to-primary-light text-white border-0 relative overflow-hidden" hover={false}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Info size={100} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <Info size={20} className="text-secondary" /> AI Tax Insight
                            </h3>
                            {!explanation && (
                                <button 
                                    onClick={getExplanation} 
                                    disabled={explaining}
                                    className="text-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {explaining ? 'Analyzing...' : 'Analyze Now'}
                                </button>
                            )}
                        </div>
                        
                        {explanation ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <div className="text-slate-200 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>') }} />
                            </div>
                        ) : (
                            <div className="text-slate-300 text-sm italic border border-white/10 rounded-xl p-4 bg-white/5">
                                <p className="mb-2">Click "Analyze Now" to get a personalized explanation of your tax liability based on NBR rules.</p>
                                <ul className="list-disc list-inside text-xs space-y-1 opacity-70">
                                    <li>Why your tax is {taxData.taxPayable > 0 ? 'calculated at this amount' : 'zero'}</li>
                                    <li>How your {taxData.taxpayerCategory} status affects the limit</li>
                                    <li>Tips to reduce tax legally</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-5" hover={false}>
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-amber-500" /> Important Note
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        This calculation is based on the Finance Act 2024. Please consult with a certified tax practitioner before filing your final return.
                    </p>
                </Card>
            </motion.div>
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
};

export default Tax;
