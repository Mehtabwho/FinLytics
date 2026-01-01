import React from 'react';
import { useFinancialYear } from '../context/FinancialYearContext';
import { Calendar } from 'lucide-react';

const FinancialYearSelector = () => {
  const { year, setYear } = useFinancialYear();
  const years = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Calendar size={14} />
      </div>
      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary block pl-9 pr-3 py-2 font-medium cursor-pointer hover:bg-slate-100 transition-colors outline-none appearance-none"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            FY {y}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FinancialYearSelector;
