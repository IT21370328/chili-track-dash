import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Wallet, Receipt } from "lucide-react"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { calculateSummary, mockExpenses, mockPrimaTransactions } from "@/lib/mockData"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const summary = calculateSummary()

  // Chart data
  const expensesByCategory = mockExpenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.category === expense.category)
    if (existing) {
      existing.amount += expense.cost
    } else {
      acc.push({ category: expense.category, amount: expense.cost })
    }
    return acc
  }, [] as { category: string; amount: number }[])

  const monthlyData = [
    { month: 'Nov', income: 3500, expenses: 2800 },
    { month: 'Dec', income: 4200, expenses: 3100 },
    { month: 'Jan', income: 3750, expenses: 2950 },
  ]

  const paymentStatusData = mockPrimaTransactions.reduce((acc, transaction) => {
    const existing = acc.find(item => item.status === transaction.paymentStatus)
    if (existing) {
      existing.count += 1
      existing.amount += transaction.amount
    } else {
      acc.push({ 
        status: transaction.paymentStatus, 
        count: 1, 
        amount: transaction.amount 
      })
    }
    return acc
  }, [] as { status: string; count: number; amount: number }[])

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Revenue"
          value={`$${summary.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: "12.5%", isPositive: true }}
          description="From Prima deliveries"
        />
        <SummaryCard
          title="Total Expenses"
          value={`$${summary.totalExpenses.toLocaleString()}`}
          icon={Receipt}
          trend={{ value: "8.2%", isPositive: false }}
          description="All operational costs"
        />
        <SummaryCard
          title="Net Profit"
          value={`$${summary.netProfit.toLocaleString()}`}
          icon={summary.netProfit >= 0 ? TrendingUp : TrendingDown}
          trend={{ value: "15.3%", isPositive: summary.netProfit >= 0 }}
          description="Revenue minus expenses"
        />
        <SummaryCard
          title="Petty Cash Balance"
          value={`$${summary.pettyCashBalance.toLocaleString()}`}
          icon={Wallet}
          description="Available cash on hand"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="card-primary p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Pie Chart */}
        <div className="card-primary p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status} (${count})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="card-primary p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Income vs Expenses Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="hsl(var(--success))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--success))' }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--destructive))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Dashboard