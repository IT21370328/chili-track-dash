import { useState } from "react"
import { Plus, Users, DollarSign, Clock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { mockEmployees } from "@/lib/mockData"
import { useToast } from "@/hooks/use-toast"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const Salaries = () => {
  const [formData, setFormData] = useState({
    name: '',
    salary: ''
  })
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Employee Added",
      description: `Added ${formData.name} with salary $${formData.salary}`,
    })
    setFormData({ name: '', salary: '' })
  }

  const handlePayment = (employeeId: string, employeeName: string) => {
    toast({
      title: "Payment Recorded",
      description: `Marked salary payment for ${employeeName} as paid`,
    })
  }

  const totalSalaries = mockEmployees.reduce((sum, emp) => sum + emp.salary, 0)
  const paidSalaries = mockEmployees.filter(emp => emp.status === 'paid').reduce((sum, emp) => sum + emp.salary, 0)
  const unpaidSalaries = mockEmployees.filter(emp => emp.status === 'unpaid').reduce((sum, emp) => sum + emp.salary, 0)
  const paidCount = mockEmployees.filter(emp => emp.status === 'paid').length
  const unpaidCount = mockEmployees.filter(emp => emp.status === 'unpaid').length

  const chartData = [
    { name: 'Paid', value: paidSalaries, count: paidCount },
    { name: 'Unpaid', value: unpaidSalaries, count: unpaidCount }
  ]

  const COLORS = {
    'Paid': '#10b981',
    'Unpaid': '#f59e0b'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Employee Salaries</h1>
        <p className="text-muted-foreground">Manage employee payroll and payment status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Employees"
          value={mockEmployees.length.toString()}
          icon={Users}
          description="Active employees"
        />
        <SummaryCard
          title="Total Salaries"
          value={`$${totalSalaries.toLocaleString()}`}
          icon={DollarSign}
          description="Monthly payroll"
        />
        <SummaryCard
          title="Paid This Month"
          value={`$${paidSalaries.toLocaleString()}`}
          icon={Check}
          description={`${paidCount} employees paid`}
        />
        <SummaryCard
          title="Pending Payments"
          value={`$${unpaidSalaries.toLocaleString()}`}
          icon={Clock}
          description={`${unpaidCount} employees pending`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="form-card">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Add Employee</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Employee Name</Label>
                <Input
                  id="name"
                  placeholder="Enter employee name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="salary">Monthly Salary ($)</Label>
                <Input
                  id="salary"
                  type="number"
                  step="0.01"
                  placeholder="Enter monthly salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full btn-primary">
                Add Employee
              </Button>
            </form>
          </Card>

          {/* Salary Distribution Chart */}
          <Card className="form-card mt-6">
            <h3 className="text-lg font-semibold mb-4">Payment Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name} (${count})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
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

        <div className="lg:col-span-2">
          <Card className="form-card">
            <h3 className="text-lg font-semibold mb-4">Employee Payroll</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Monthly Salary</TableHead>
                    <TableHead>Last Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>${employee.salary.toLocaleString()}</TableCell>
                      <TableCell>{new Date(employee.lastPaid).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          employee.status === 'paid' 
                            ? 'status-success' 
                            : 'status-warning'
                        }`}>
                          {employee.status === 'paid' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {employee.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {employee.status === 'unpaid' && (
                          <Button 
                            size="sm" 
                            onClick={() => handlePayment(employee.id, employee.name)}
                            className="btn-primary"
                          >
                            Mark Paid
                          </Button>
                        )}
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

export default Salaries