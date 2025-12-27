import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText, Info, Calculator, ShieldCheck, AlertCircle, Download, RefreshCw } from 'lucide-react';

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
    <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Calculating Tax Liability...</p>
        </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="text-primary" /> Tax Manager
            </h1>
            <p className="text-slate-500 text-sm">Automated NBR-compliant tax calculation & insights</p>
        </div>
        <div className="flex gap-3">
             <select 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            >
                <option value="2024-2025">FY 2024-2025</option>
                <option value="2023-2024">FY 2023-2024</option>
            </select>
            <button onClick={fetchTaxData} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm" title="Refresh Calculation">
                <RefreshCw size={20} />
            </button>
        </div>
      </div>

      {taxData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Summary & Breakdown */}
            <div className="lg:col-span-2 space-y-6">
                {/* Main Summary Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
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
                </div>

                {/* Breakdown Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
                </div>
            </div>

            {/* Right Column: AI Insights */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-primary to-primary-light text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
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
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-amber-500" /> Important Note
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        This calculation is based on the Finance Act 2024. Please consult with a certified tax practitioner before filing your final return.
                    </p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Tax;
