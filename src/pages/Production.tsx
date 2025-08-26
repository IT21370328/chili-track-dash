import { useState } from "react"
import { Plus, Factory, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { mockProduction } from "@/lib/mockData"
import { useToast } from "@/hooks/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Production = () => {
  const [formData, setFormData] = useState({
    date: '',
    kilosIn: '',
    powderOut: ''
  })
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const efficiency = (parseFloat(formData.powderOut) / parseFloat(formData.kilosIn)) * 100
    toast({
      title: "Production Record Added",
      description: `Processed ${formData.kilosIn}kg with ${efficiency.toFixed(1)}% efficiency`,
    })
    setFormData({ date: '', kilosIn: '', powderOut: '' })
  }

  const avgEfficiency = mockProduction.reduce((sum, record) => sum + record.efficiency, 0) / mockProduction.length
  const totalKilosIn = mockProduction.reduce((sum, record) => sum + record.kilosIn, 0)
  const totalPowderOut = mockProduction.reduce((sum, record) => sum + record.powderOut, 0)

  const efficiency = formData.kilosIn && formData.powderOut 
    ? ((parseFloat(formData.powderOut) / parseFloat(formData.kilosIn)) * 100).toFixed(1)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Production Processing</h1>
        <p className="text-muted-foreground">Track input materials and output efficiency</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Average Efficiency"
          value={`${avgEfficiency.toFixed(1)}%`}
          icon={Gauge}
          description="Conversion rate"
        />
        <SummaryCard
          title="Total Input"
          value={`${totalKilosIn}kg`}
          icon={Factory}
          description="Raw materials processed"
        />
        <SummaryCard
          title="Total Output"
          value={`${totalPowderOut}kg`}
          icon={Plus}
          description="Powder produced"
        />
        <SummaryCard
          title="Overall Efficiency"
          value={`${((totalPowderOut / totalKilosIn) * 100).toFixed(1)}%`}
          icon={Gauge}
          description="Total conversion rate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="form-card">
            <div className="flex items-center gap-2 mb-4">
              <Factory className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Production Entry</h3>
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
                <Label htmlFor="kilosIn">Input (kg)</Label>
                <Input
                  id="kilosIn"
                  type="number"
                  step="0.1"
                  placeholder="Kilos sent to machine"
                  value={formData.kilosIn}
                  onChange={(e) => setFormData({ ...formData, kilosIn: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="powderOut">Output (kg)</Label>
                <Input
                  id="powderOut"
                  type="number"
                  step="0.1"
                  placeholder="Powder quantity produced"
                  value={formData.powderOut}
                  onChange={(e) => setFormData({ ...formData, powderOut: e.target.value })}
                  required
                />
              </div>
              
              {efficiency && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Efficiency: {efficiency}%
                  </p>
                  <div className="w-full bg-background rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(parseFloat(efficiency), 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <Button type="submit" className="w-full btn-primary">
                Record Production
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="form-card">
            <h3 className="text-lg font-semibold mb-4">Production History</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Input (kg)</TableHead>
                    <TableHead>Output (kg)</TableHead>
                    <TableHead>Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProduction.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.kilosIn}</TableCell>
                      <TableCell>{record.powderOut}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{record.efficiency.toFixed(1)}%</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.min(record.efficiency, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      {/* Efficiency Chart */}
      <Card className="form-card">
        <h3 className="text-lg font-semibold mb-4">Efficiency Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockProduction}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value}%`, 'Efficiency']}
            />
            <Bar dataKey="efficiency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

export default Production