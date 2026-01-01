const getFinancialYear = (date = new Date()) => {
  const d = new Date(date);
  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();

  let startYear, endYear;

  if (month >= 7) {
    startYear = year;
    endYear = year + 1;
  } else {
    startYear = year - 1;
    endYear = year;
  }

  return `${startYear}-${endYear}`;
};

const validateFinancialYear = (yearStr) => {
  const regex = /^\d{4}-\d{4}$/;
  if (!regex.test(yearStr)) return false;

  const [start, end] = yearStr.split('-').map(Number);
  return end === start + 1;
};

const getAssessmentYear = (incomeYear) => {
  if (!validateFinancialYear(incomeYear)) {
    throw new Error('Invalid financial year format');
  }
  const [start, end] = incomeYear.split('-').map(Number);
  return `${start + 1}-${end + 1}`;
};

module.exports = {
  getFinancialYear,
  validateFinancialYear,
  getAssessmentYear,
};
