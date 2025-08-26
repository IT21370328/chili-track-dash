import { useState } from "react"
import { Plus, FileText, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { mockBills } from "@/lib/mockData"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Bills = () => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    date: '',
    recurring: false
  })
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Bill Added",
      description: `Added ${formData.description} bill for $${formData.amount}`,
    })
    setFormData({ category: '', description: '', amount: '', date: '', recurring: false })
  }

  const totalBills = mockBills.reduce((sum, bill) => sum + bill.amount, 0)
  const recurringBills = mockBills.filter(bill => bill.recurring).reduce((sum, bill) => sum + bill.amount, 0)
  const oneTimeBills = mockBills.filter(bill => !bill.recurring).reduce((sum, bill) => sum + bill.amount, 0)

  // Mock monthly trend data
  const monthlyTrend = [
    { month: 'Oct', amount: 950 },
    { month: 'Nov', amount: 1200 },
    { month: 'Dec', amount: 1150 },
    { month: 'Jan', amount: 1270 }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bills & Utilities</h1>
        <p className="text-muted-foreground">Track recurring and one-time utility bills</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Bills"
          value={`$${totalBills.toLocaleString()}`}
          icon={FileText}
          description="Current month total"
        />
        <SummaryCard
          title="Recurring Bills"
          value={`$${recurringBills.toLocaleString()}`}
          icon={Calendar}
          description="Monthly recurring"
        />
        <SummaryCard
          title="One-time Bills"
          value={`$${oneTimeBills.toLocaleString()}`}
          icon={Plus}
          description="Non-recurring expenses"
        />
        <SummaryCard
          title="Monthly Average"
          value={`$${(monthlyTrend.reduce((sum, m) => sum + m.amount, 0) / monthlyTrend.length).toFixed(0)}`}
          icon={TrendingUp}
          description="4-month average"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="form-card">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Add Bill</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Rent">Rent</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Electricity bill"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                <Label htmlFor="date">Due Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="recurring"
                  checked={formData.recurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, recurring: !!checked })}
                />
                <Label htmlFor="recurring">Recurring monthly bill</Label>
              </div>
              
              <Button type="submit" className="w-full btn-primary">
                Add Bill
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="form-card">
            <h3 className="text-lg font-semibold mb-4">Current Bills</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {bill.category}
                        </span>
                      </TableCell>
                      <TableCell>{bill.description}</TableCell>
                      <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bill.recurring 
                            ? 'bg-primary text-primary-foreground' 
                            : 'status-pending'
                        }`}>
                          {bill.recurring ? 'Recurring' : 'One-time'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${bill.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <Card className="form-card">
        <h3 className="text-lg font-semibold mb-4">Monthly Bill Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value) => [`$${value}`, 'Bills']}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

export default Bills