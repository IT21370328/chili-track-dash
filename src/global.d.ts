export {};

declare global {
  interface Window {
    api: {
      // Purchases
      addPurchase: (purchase: any) => Promise<any>;
      getPurchases: () => Promise<any[]>;
      getSummary: () => Promise<any>;

      // Pettycash
      addPettyCash: (transaction: any) => Promise<any>;
      getPettyCash: () => Promise<any[]>;
      getPettyCashSummary: () => Promise<any>;

      // Expenses
      addExpense: (expense: any) => Promise<any>;
      getExpenses: () => Promise<any[]>;
      getExpensesSummary: () => Promise<any>;

      // ✅ Production
      addProduction: (production: any) => Promise<any>;
      getProduction: () => Promise<any[]>;
      getProductionSummary: () => Promise<any>;
    };
  }
}
