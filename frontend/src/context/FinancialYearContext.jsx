import React, { createContext, useState, useContext, useEffect } from 'react';

const FinancialYearContext = createContext();

export const useFinancialYear = () => useContext(FinancialYearContext);

export const FinancialYearProvider = ({ children }) => {
  // Default to current year logic or load from localStorage
  const getInitialYear = () => {
    const saved = localStorage.getItem('financialYear');
    if (saved) return saved;
    
    // Default logic: Bangladesh FY
    const d = new Date();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    let startYear, endYear;
    if (month >= 7) {
      startYear = year;
      endYear = year + 1;
    } else {
      startYear = year - 1;
      endYear = year;
    }
    const defaultYear = `${startYear}-${endYear}`;
    localStorage.setItem('financialYear', defaultYear);
    return defaultYear;
  };

  const [year, setYear] = useState(getInitialYear);

  const changeYear = (newYear) => {
    setYear(newYear);
    localStorage.setItem('financialYear', newYear);
  };

  return (
    <FinancialYearContext.Provider value={{ year, setYear: changeYear }}>
      {children}
    </FinancialYearContext.Provider>
  );
};
