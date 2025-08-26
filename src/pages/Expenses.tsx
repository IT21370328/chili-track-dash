import { useState } from "react"
import { Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockExpenses } from "@/lib/mockData"
import { useToast } from "@/hooks/use-toast"

const Expenses = () => {
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    description: '',
    cost: ''
  })
  const [filter, setFilter] = useState('')
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Expense Added",
      description: `Added ${formData.description} for $${formData.cost}`,
    })
    setFormData({ date: '', category: '', description: '', cost: '' })
  }

  const filteredExpenses = mockExpenses.filter(expense => 
    filter === 'all' || filter === '' || expense.category.toLowerCase().includes(filter.toLowerCase())
  )

  const categories = [...new Set(mockExpenses.map(e => e.category))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
        <p className="text-muted-foreground">Track other business expenses like sugar, oil, utilities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="form-card">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Add Expense</h3>
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
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
              
              <div>
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="Enter cost"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full btn-primary">
                Add Expense
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="form-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Expense History</h3>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${expense.cost.toFixed(2)}
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

export default Expenses