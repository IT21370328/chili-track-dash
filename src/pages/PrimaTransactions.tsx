import { useState } from "react"
import { Plus, Truck, DollarSign, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { mockPrimaTransactions } from "@/lib/mockData"
import { useToast } from "@/hooks/use-toast"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const PrimaTransactions = () => {
  const [formData, setFormData] = useState({
    date: '',
    kilosDelivered: '',
    paymentStatus: '',
    amount: ''
  })
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Delivery Recorded",
      description: `Added delivery of ${formData.kilosDelivered}kg to Prima Company`,
    })
    setFormData({ date: '', kilosDelivered: '', paymentStatus: '', amount: '' })
  }

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

  const totalDelivered = mockPrimaTransactions.reduce((sum, t) => sum + t.kilosDelivered, 0)
  const totalRevenue = mockPrimaTransactions.reduce((sum, t) => sum + t.amount, 0)
  const paidAmount = mockPrimaTransactions.filter(t => t.paymentStatus === 'Cash Received').reduce((sum, t) => sum + t.amount, 0)

  const COLORS = {
    'Cash Received': '#10b981',
    'Pending': '#f59e0b', 
    'Rejected': '#ef4444'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Prima Company Transactions</h1>
        <p className="text-muted-foreground">Track deliveries and payment status with Prima Company</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Delivered"
          value={`${totalDelivered}kg`}
          icon={Truck}
          description="Kilos delivered to Prima"
        />
        <SummaryCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          description="Expected revenue"
        />
        <SummaryCard
          title="Paid Amount"
          value={`$${paidAmount.toLocaleString()}`}
          icon={DollarSign}
          description="Cash received"
        />
        <SummaryCard
          title="Pending Amount"
          value={`$${(totalRevenue - paidAmount).toLocaleString()}`}
          icon={Clock}
          description="Awaiting payment"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="form-card">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Record Delivery</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Delivery Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="kilosDelivered">Kilos Delivered</Label>
                <Input
                  id="kilosDelivered"
                  type="number"
                  step="0.1"
                  placeholder="Enter kilos delivered"
                  value={formData.kilosDelivered}
                  onChange={(e) => setFormData({ ...formData, kilosDelivered: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash Received">Cash Received</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full btn-primary">
                Record Delivery
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="form-card">
            <h3 className="text-lg font-semibold mb-4">Delivery History</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Kilos</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPrimaTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.kilosDelivered}kg</TableCell>
                      <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.paymentStatus === 'Cash Received' 
                            ? 'status-success' 
                            : transaction.paymentStatus === 'Pending'
                            ? 'status-warning'
                            : 'bg-destructive text-destructive-foreground'
                        }`}>
                          {transaction.paymentStatus === 'Cash Received' && <DollarSign className="w-3 h-3" />}
                          {transaction.paymentStatus === 'Pending' && <Clock className="w-3 h-3" />}
                          {transaction.paymentStatus === 'Rejected' && <X className="w-3 h-3" />}
                          {transaction.paymentStatus}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Status Chart */}
      <Card className="form-card">
        <h3 className="text-lg font-semibold mb-4">Payment Status Breakdown</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status} (${count})`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS]} />
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
      </Card>
    </div>
  )
}

export default PrimaTransactions