// Mock data to simulate SQLite database functionality

export interface Purchase {
  id: string
  date: string
  quantity: number
  price: number
  paymentMethod: 'debit' | 'cash'
  total: number
}

export interface PettyCashTransaction {
  id: string
  date: string
  type: 'inflow' | 'outflow'
  amount: number
  description: string
  balance: number
}

export interface Expense {
  id: string
  date: string
  category: string
  description: string
  cost: number
}

export interface ProductionRecord {
  id: string
  date: string
  kilosIn: number
  powderOut: number
  efficiency: number
}

export interface PrimaTransaction {
  id: string
  date: string
  kilosDelivered: number
  paymentStatus: 'Cash Received' | 'Pending' | 'Rejected'
  amount: number
}

export interface Bill {
  id: string
  category: string
  description: string
  amount: number
  date: string
  recurring: boolean
}

export interface Employee {
  id: string
  name: string
  salary: number
  lastPaid: string
  status: 'paid' | 'unpaid'
}

// Mock data
export const mockPurchases: Purchase[] = [
  { id: '1', date: '2024-01-15', quantity: 500, price: 2.50, paymentMethod: 'cash', total: 1250 },
  { id: '2', date: '2024-01-10', quantity: 300, price: 2.45, paymentMethod: 'debit', total: 735 },
  { id: '3', date: '2024-01-05', quantity: 750, price: 2.60, paymentMethod: 'cash', total: 1950 },
]

export const mockPettyCash: PettyCashTransaction[] = [
  { id: '1', date: '2024-01-20', type: 'inflow', amount: 500, description: 'Cash deposit', balance: 1200 },
  { id: '2', date: '2024-01-18', type: 'outflow', amount: 50, description: 'Office supplies', balance: 700 },
  { id: '3', date: '2024-01-15', type: 'outflow', amount: 30, description: 'Transport', balance: 750 },
]

export const mockExpenses: Expense[] = [
  { id: '1', date: '2024-01-20', category: 'Raw Materials', description: 'Sugar purchase', cost: 450 },
  { id: '2', date: '2024-01-18', category: 'Raw Materials', description: 'Cooking oil', cost: 280 },
  { id: '3', date: '2024-01-15', category: 'Utilities', description: 'Electricity bill', cost: 320 },
]

export const mockProduction: ProductionRecord[] = [
  { id: '1', date: '2024-01-20', kilosIn: 100, powderOut: 25, efficiency: 25 },
  { id: '2', date: '2024-01-18', kilosIn: 80, powderOut: 22, efficiency: 27.5 },
  { id: '3', date: '2024-01-15', kilosIn: 120, powderOut: 28, efficiency: 23.3 },
]

export const mockPrimaTransactions: PrimaTransaction[] = [
  { id: '1', date: '2024-01-20', kilosDelivered: 25, paymentStatus: 'Cash Received', amount: 1250 },
  { id: '2', date: '2024-01-18', kilosDelivered: 22, paymentStatus: 'Pending', amount: 1100 },
  { id: '3', date: '2024-01-15', kilosDelivered: 28, paymentStatus: 'Cash Received', amount: 1400 },
]

export const mockBills: Bill[] = [
  { id: '1', category: 'Utilities', description: 'Electricity', amount: 320, date: '2024-01-15', recurring: true },
  { id: '2', category: 'Rent', description: 'Factory rent', amount: 800, date: '2024-01-01', recurring: true },
  { id: '3', category: 'Utilities', description: 'Water', amount: 150, date: '2024-01-10', recurring: true },
]

export const mockEmployees: Employee[] = [
  { id: '1', name: 'John Doe', salary: 2500, lastPaid: '2024-01-01', status: 'paid' },
  { id: '2', name: 'Jane Smith', salary: 2200, lastPaid: '2024-01-01', status: 'paid' },
  { id: '3', name: 'Mike Johnson', salary: 1800, lastPaid: '2023-12-15', status: 'unpaid' },
]

// Summary calculations
export const calculateSummary = () => {
  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.cost, 0) +
                       mockBills.reduce((sum, bill) => sum + bill.amount, 0)
  
  const totalRevenue = mockPrimaTransactions
    .filter(t => t.paymentStatus === 'Cash Received')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  
  const netProfit = totalRevenue - totalExpenses
  
  const totalDebitPurchases = mockPurchases
    .filter(p => p.paymentMethod === 'debit')
    .reduce((sum, purchase) => sum + purchase.total, 0)
  
  const totalCashPurchases = mockPurchases
    .filter(p => p.paymentMethod === 'cash')
    .reduce((sum, purchase) => sum + purchase.total, 0)
  
  const pettyCashBalance = mockPettyCash.length > 0 ? mockPettyCash[0].balance : 0
  
  return {
    totalExpenses,
    totalRevenue,
    netProfit,
    totalDebitPurchases,
    totalCashPurchases,
    pettyCashBalance
  }
}