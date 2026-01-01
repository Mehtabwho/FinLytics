import React from 'react';
import { useFinancialYear } from '../context/FinancialYearContext';
import { Calendar } from 'lucide-react';

const FinancialYearSelector = () => {
  const { year, setYear } = useFinancialYear();
  const years = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];

  return (
    <div className="px-4 pb-4">
      <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
        <label className="text-xs font-semibold text-primary/70 mb-1.5 flex items-center gap-1">
          <Calendar size={12} />
          Financial Year
        </label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full bg-white border border-primary/20 text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 font-medium cursor-pointer hover:border-primary/40 transition-colors outline-none"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FinancialYearSelector;
