/**
 * FinLytics Financial Analysis Utility
 * Handles deterministic financial calculations, health scoring, and pattern detection
 * All logic is rule-based (no AI involvement)
 */

class FinancialAnalyzer {
  /**
   * Calculate core financial metrics from income and expenses
   * @param {Array} incomes - Array of income documents
   * @param {Array} expenses - Array of expense documents
   * @param {Number} totalTax - Total tax amount for the period
   * @param {Number} totalRebate - Total tax rebate amount for the period
   * @param {Number} maxRebateCapacity - Maximum allowed rebate capacity
   * @param {Array} goals - Array of user goals
   * @returns {Object} Structured financial metrics
   */
  static calculateCoreMetrics(incomes = [], expenses = [], totalTax = 0, totalRebate = 0, maxRebateCapacity = 0, goals = []) {
    // Calculate totals
    const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
    const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    
    // Calculate savings
    const savings = Math.max(0, totalIncome - totalExpense - totalTax);
    
    // Calculate ratios with division by zero protection
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const taxRatio = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;
    const rebateUtilization = maxRebateCapacity > 0 ? (totalRebate / maxRebateCapacity) * 100 : 0;

    // Calculate monthly averages (approximate for simplicity)
    const monthlyIncome = totalIncome / 12;
    const monthlyExpense = totalExpense / 12;
    const monthlySavings = savings / 12;
    
    // Calculate emergency fund estimate (in months)
    const emergencyFundMonths = monthlyExpense > 0 ? savings / monthlyExpense : 0;

    // Calculate goal progress
    const goalProgress = this.calculateGoalProgress(goals, savings);

    // Income and spending trend analysis
    const { incomeGrowthTrend, spendingTrend } = this.analyzeTrends(incomes, expenses);

    // Cash flow consistency
    const cashFlowConsistency = this.calculateCashFlowConsistency(incomes, expenses);

    // Financial stability status
    const financialStabilityStatus = this.getFinancialStabilityStatus(savingsRate, emergencyFundMonths, expenseRatio);

    return {
      // Totals
      totalIncome,
      totalExpense,
      totalTax,
      totalRebate,
      savings,
      
      // Averages
      monthlyIncome,
      monthlyExpense,
      monthlySavings,
      
      // Ratios
      savingsRate: Math.round(savingsRate * 10) / 10,
      expenseRatio: Math.round(expenseRatio * 10) / 10,
      taxRatio: Math.round(taxRatio * 10) / 10,
      rebateUtilization: Math.round(rebateUtilization * 10) / 10,
      
      // Emergency Fund
      emergencyFundMonths: Math.round(emergencyFundMonths * 10) / 10,
      
      // Trends & Stability
      incomeGrowthTrend,
      spendingTrend,
      cashFlowConsistency,
      financialStabilityStatus,
      
      // Goals
      goalProgress,
    };
  }

  /**
   * Calculate goal progress percentage
   * @param {Array} goals - Array of goal documents
   * @param {Number} totalSavings - Total savings available
   * @returns {Object} Goal progress metrics
   */
  static calculateGoalProgress(goals = [], totalSavings = 0) {
    if (goals.length === 0) {
      return { averageProgress: 0, activeGoals: 0 };
    }

    let totalProgress = 0;
    goals.forEach(goal => {
      if (goal.targetAmount > 0) {
        totalProgress += (goal.currentAmount / goal.targetAmount) * 100;
      }
    });

    return {
      averageProgress: Math.round(totalProgress / goals.length),
      activeGoals: goals.length,
    };
  }

  /**
   * Analyze income and spending trends
   * @param {Array} incomes - Array of income documents
   * @param {Array} expenses - Array of expense documents
   * @returns {Object} Trend analysis
   */
  static analyzeTrends(incomes = [], expenses = []) {
    // For this demo, we'll use a simple heuristic
    // In production, you'd analyze month-over-month changes
    const incomeGrowthTrend = 'stable'; // 'increasing', 'stable', 'decreasing'
    const spendingTrend = 'stable'; // 'increasing', 'stable', 'decreasing'

    return { incomeGrowthTrend, spendingTrend };
  }

  /**
   * Calculate cash flow consistency score
   * @param {Array} incomes - Array of income documents
   * @param {Array} expenses - Array of expense documents
   * @returns {String} Consistency level
   */
  static calculateCashFlowConsistency(incomes = [], expenses = []) {
    // For this demo, return a simple consistency level
    // In production, analyze variance in monthly income/expenses
    return 'consistent'; // 'inconsistent', 'consistent', 'very consistent'
  }

  /**
   * Determine financial stability status
   * @param {Number} savingsRate - Savings rate percentage
   * @param {Number} emergencyFundMonths - Emergency fund in months
   * @param {Number} expenseRatio - Expense ratio percentage
   * @returns {String} Stability status
   */
  static getFinancialStabilityStatus(savingsRate, emergencyFundMonths, expenseRatio) {
    if (savingsRate >= 20 && emergencyFundMonths >= 6 && expenseRatio < 70) {
      return 'strong';
    } else if (savingsRate >= 10 && emergencyFundMonths >= 3 && expenseRatio < 80) {
      return 'moderate';
    } else {
      return 'low';
    }
  }

  /**
   * Analyze expense categories to find top spending areas
   * @param {Array} expenses - Array of expense documents
   * @returns {Object} Top expense category and category breakdown
   */
  static analyzeExpenseCategories(expenses = []) {
    const categoryTotals = {};

    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += Number(expense.amount || 0);
    });

    // Find top category
    let topExpenseCategory = { name: 'None', amount: 0 };
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a);

    if (sortedCategories.length > 0) {
      topExpenseCategory = {
        name: sortedCategories[0][0],
        amount: sortedCategories[0][1],
      };
    }

    // Check for excessive expense concentration (one category > 40% of total)
    const totalExpense = Object.values(categoryTotals).reduce((sum, amt) => sum + amt, 0);
    const excessiveConcentration = totalExpense > 0 && (topExpenseCategory.amount / totalExpense) > 0.4;

    return {
      topExpenseCategory,
      categoryBreakdown: categoryTotals,
      sortedCategories,
      excessiveConcentration,
    };
  }

  /**
   * Calculate Financial Health Score (0-100)
   * @param {Object} metrics - Core financial metrics from calculateCoreMetrics
   * @returns {Number} Financial health score
   */
  static calculateFinancialHealthScore(metrics) {
    let score = 50; // Base score
    
    // 1. Savings rate impact (max +30, min -30)
    // Ideal: 20%+
    if (metrics.savingsRate >= 20) score += 30;
    else if (metrics.savingsRate >= 15) score += 20;
    else if (metrics.savingsRate >= 10) score += 10;
    else if (metrics.savingsRate >= 5) score += 5;
    else if (metrics.savingsRate > 0) score += 0;
    else score -= 20;

    // 2. Emergency fund impact (max +20, min -15)
    // Ideal: 6+ months
    if (metrics.emergencyFundMonths >= 6) score += 20;
    else if (metrics.emergencyFundMonths >= 3) score += 10;
    else if (metrics.emergencyFundMonths >= 1) score += 5;
    else if (metrics.emergencyFundMonths > 0) score += 0;
    else score -= 15;

    // 3. Expense ratio impact (max +20, min -30)
    // Ideal: <70%
    if (metrics.expenseRatio < 60) score += 20;
    else if (metrics.expenseRatio < 70) score += 10;
    else if (metrics.expenseRatio < 80) score += 0;
    else if (metrics.expenseRatio < 90) score -= 10;
    else score -= 30;

    // 4. Tax ratio impact (max +10, min -10)
    // Ideal: 10-25% (depends on income bracket)
    if (metrics.taxRatio >= 10 && metrics.taxRatio <= 25) score += 10;
    else if (metrics.taxRatio > 25 && metrics.taxRatio <= 35) score += 0;
    else if (metrics.taxRatio > 35) score -= 10;

    // Clamp score between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Detect spending patterns and anomalies
   * @param {Array} expenses - Current period expenses
   * @param {Array} previousExpenses - Previous period expenses
   * @param {Object} metrics - Core financial metrics
   * @param {Object} categoryAnalysis - Category analysis data
   * @returns {Array} Machine-readable insights and alerts
   */
  static detectSpendingPatterns(expenses = [], previousExpenses = [], metrics, categoryAnalysis) {
    const insights = [];
    const alerts = [];
    
    const { categoryBreakdown: currentCategories } = categoryAnalysis;
    const { categoryBreakdown: previousCategories } = this.analyzeExpenseCategories(previousExpenses);

    // 1. Check savings rate health
    if (metrics.savingsRate < 10) {
      alerts.push({
        type: 'warning',
        title: 'Low Savings Rate',
        message: `Your savings rate (${metrics.savingsRate}%) is below the healthy threshold of 10%+`,
        severity: 'high'
      });
    }

    // 2. Check expense ratio
    if (metrics.expenseRatio > 80) {
      alerts.push({
        type: 'warning',
        title: 'High Expense Ratio',
        message: `Your expense ratio (${metrics.expenseRatio}%) is very high - consider reducing spending`,
        severity: 'high'
      });
    }

    // 3. Check emergency fund
    if (metrics.emergencyFundMonths < 3) {
      alerts.push({
        type: 'warning',
        title: 'Low Emergency Reserve',
        message: `Your emergency fund (${metrics.emergencyFundMonths} months) is below the recommended 3-6 months`,
        severity: metrics.emergencyFundMonths < 1 ? 'critical' : 'medium'
      });
    }

    // 4. Detect category growth (if previous period data available)
    for (const [category, currentAmount] of Object.entries(currentCategories)) {
      const previousAmount = previousCategories[category] || 0;
      
      if (previousAmount > 0 && currentAmount > previousAmount * 1.2) { // >20% increase
        const percentIncrease = Math.round(((currentAmount - previousAmount) / previousAmount) * 100);
        insights.push(`${category} expenses increased by ${percentIncrease}% compared to previous period`);
        alerts.push({
          type: 'info',
          title: 'Spending Increase Detected',
          message: `${category} expenses increased by ${percentIncrease}%`,
          severity: 'low'
        });
      }
    }

    // 5. Check for unusually high individual expenses
    const avgExpense = expenses.length > 0 ? metrics.totalExpense / expenses.length : 0;
    expenses.forEach(expense => {
      if (expense.amount > avgExpense * 3) { // 3x above average
        insights.push(`${expense.description || expense.category} spending (৳${expense.amount.toLocaleString()}) is unusually high`);
      }
    });

    // 6. Check for excessive expense concentration
    if (categoryAnalysis.excessiveConcentration) {
      alerts.push({
        type: 'warning',
        title: 'Expense Concentration Risk',
        message: `${categoryAnalysis.topExpenseCategory.name} accounts for a large portion of your total expenses`,
        severity: 'medium'
      });
    }

    return { insights, alerts };
  }

  /**
   * Main entry point - run complete financial analysis
   * @param {Object} params - Analysis parameters
   * @returns {Object} Complete analysis results
   */
  static analyze({ 
    incomes = [], 
    expenses = [], 
    totalTax = 0, 
    totalRebate = 0, 
    maxRebateCapacity = 0,
    previousExpenses = [],
    goals = [],
  }) {
    // Step 1: Calculate core metrics
    const metrics = this.calculateCoreMetrics(
      incomes, expenses, totalTax, 
      totalRebate, maxRebateCapacity, goals
    );
    
    // Step 2: Analyze expense categories
    const categoryAnalysis = this.analyzeExpenseCategories(expenses);
    
    // Step 3: Calculate health score
    const financialHealthScore = this.calculateFinancialHealthScore(metrics);
    
    // Step 4: Detect patterns
    const { insights: spendingPatterns, alerts } = this.detectSpendingPatterns(
      expenses, previousExpenses, metrics, categoryAnalysis
    );
    
    // Compile full analysis
    return {
      metrics: {
        ...metrics,
        topExpenseCategory: categoryAnalysis.topExpenseCategory,
        categoryBreakdown: categoryAnalysis.categoryBreakdown,
      },
      financialHealthScore,
      healthStatus: this.getHealthStatusLabel(financialHealthScore),
      healthExplanation: this.getHealthExplanation(financialHealthScore, metrics),
      spendingPatterns,
      alerts,
      categoryAnalysis,
    };
  }

  /**
   * Get human-readable health status label from score
   * @param {Number} score - Financial health score (0-100)
   * @returns {String} Health status label
   */
  static getHealthStatusLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Critical';
  }

  /**
   * Get explanation for health score
   * @param {Number} score - Financial health score (0-100)
   * @param {Object} metrics - Core financial metrics
   * @returns {String} Health explanation
   */
  static getHealthExplanation(score, metrics) {
    if (score >= 80) {
      return 'Your financial health is excellent! You are saving at a healthy rate and have a solid emergency reserve.';
    } else if (score >= 65) {
      return 'Your financial health is good, but there are some areas you can improve, especially your emergency fund.';
    } else if (score >= 50) {
      return 'Your financial health is fair. Focus on increasing your savings rate and building your emergency reserve.';
    } else if (score >= 30) {
      return 'Your financial health needs attention. Your expenses are high relative to income, and your emergency fund is low.';
    } else {
      return 'Your financial health is in critical condition. Immediate action is needed to reduce expenses and build savings.';
    }
  }
}

module.exports = FinancialAnalyzer;
