import { useState } from "react"
import { Plus, Calendar, Package, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { mockPurchases, calculateSummary } from "@/lib/mockData"
import { useToast } from "@/hooks/use-toast"

const Purchasing = () => {
  const [formData, setFormData] = useState({
    date: '',
    quantity: '',
    price: '',
    paymentMethod: ''
  })
  const { toast } = useToast()
  const summary = calculateSummary()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Purchase Recorded",
      description: `Added ${formData.quantity}kg of Scotch Bonnets for $${(parseFloat(formData.quantity) * parseFloat(formData.price)).toFixed(2)}`,
    })
    setFormData({ date: '', quantity: '', price: '', paymentMethod: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Purchasing - Scotch Bonnets</h1>
        <p className="text-muted-foreground">Track purchases of raw materials with payment methods</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Debit Purchases"
          value={`$${summary.totalDebitPurchases.toLocaleString()}`}
          icon={Package}
          description="All debit transactions"
        />
        <SummaryCard
          title="Total Cash Purchases"
          value={`$${summary.totalCashPurchases.toLocaleString()}`}
          icon={DollarSign}
          description="All cash transactions"
        />
        <SummaryCard
          title="Total Purchases"
          value={`$${(summary.totalDebitPurchases + summary.totalCashPurchases).toLocaleString()}`}
          icon={Calendar}
          description="Combined all methods"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Form */}
        <div className="lg:col-span-1">
          <Card className="form-card">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Add New Purchase</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price per kg ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="payment">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.quantity && formData.price && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Total: ${(parseFloat(formData.quantity) * parseFloat(formData.price)).toFixed(2)}
                  </p>
                </div>
              )}
              
              <Button type="submit" className="w-full btn-primary">
                Record Purchase
              </Button>
            </form>
          </Card>
        </div>

        {/* Purchase History */}
        <div className="lg:col-span-2">
          <Card className="form-card">
            <h3 className="text-lg font-semibold mb-4">Purchase History</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity (kg)</TableHead>
                    <TableHead>Price/kg</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                      <TableCell>{purchase.quantity}</TableCell>
                      <TableCell>${purchase.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.paymentMethod === 'cash' 
                            ? 'status-success' 
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          {purchase.paymentMethod.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${purchase.total.toFixed(2)}
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

export default Purchasing