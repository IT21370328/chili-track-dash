import { useState } from "react"
import { Plus, Minus, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { mockPettyCash, calculateSummary } from "@/lib/mockData"
import { useToast } from "@/hooks/use-toast"

const PettyCash = () => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'inflow' as 'inflow' | 'outflow'
  })
  const { toast } = useToast()
  const summary = calculateSummary()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Transaction Recorded",
      description: `${formData.type === 'inflow' ? 'Added' : 'Removed'} $${formData.amount} ${formData.type === 'inflow' ? 'to' : 'from'} petty cash`,
    })
    setFormData({ amount: '', description: '', type: 'inflow' })
  }

  const totalInflow = mockPettyCash
    .filter(t => t.type === 'inflow')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalOutflow = mockPettyCash
    .filter(t => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Petty Cash Management</h1>
        <p className="text-muted-foreground">Track cash inflow and outflow transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Current Balance"
          value={`$${summary.pettyCashBalance.toLocaleString()}`}
          icon={Wallet}
          description="Available cash on hand"
        />
        <SummaryCard
          title="Total Inflow"
          value={`$${totalInflow.toLocaleString()}`}
          icon={TrendingUp}
          description="Money added to cash"
        />
        <SummaryCard
          title="Total Outflow"
          value={`$${totalOutflow.toLocaleString()}`}
          icon={TrendingDown}
          description="Money spent from cash"
        />
        <SummaryCard
          title="Net Flow"
          value={`$${(totalInflow - totalOutflow).toLocaleString()}`}
          icon={totalInflow - totalOutflow >= 0 ? TrendingUp : TrendingDown}
          description="Inflow minus outflow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Form */}
        <div className="lg:col-span-1">
          <Card className="form-card">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Add Transaction</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'inflow' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, type: 'inflow' })}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Inflow
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'outflow' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, type: 'outflow' })}
                  className="flex items-center gap-2"
                >
                  <Minus className="w-4 h-4" />
                  Outflow
                </Button>
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
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full btn-primary">
                Record Transaction
              </Button>
            </form>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <Card className="form-card">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPettyCash.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'inflow' 
                            ? 'status-success' 
                            : 'status-warning'
                        }`}>
                          {transaction.type === 'inflow' ? (
                            <Plus className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                          {transaction.type.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.type === 'inflow' ? 'text-success' : 'text-destructive'
                      }`}>
                        {transaction.type === 'inflow' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${transaction.balance.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PettyCash