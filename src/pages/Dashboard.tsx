import { useState, useEffect, useMemo } from "react";
import { Plus, Clock, Package, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = "https://chili-track-dash.onrender.com";

interface PrimaTransaction { id: number; poNumber: string; kilosDelivered: number; amount: number; paymentStatus: "Pending" | "Approved" | "Paid" | "Rejected"; }
interface Production { id: number; kilosOut: number; }
interface Purchase { id: number; quantity: number; color: "red" | "green"; }
interface PettyCashTransaction { id: number; amount: number; type: "inflow" | "outflow"; }
interface Expense { id: string; date: string; category: string; description: string; cost: number; }

const DRY_RATIO = 0.1;

const Dashboard = () => {
  const [transactions, setTransactions] = useState<PrimaTransaction[]>([]);
  const [production, setProduction] = useState<Production[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [pettyCash, setPettyCash] = useState<PettyCashTransaction[]>([]);
  const [pettyCashSummary, setPettyCashSummary] = useState({ totalInflow: 0, totalOutflow: 0, balance: 0, totalTransactions: 0 });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [txRes, prodRes, purchaseRes, pettyRes, pettySummaryRes, expenseRes] = await Promise.all([
        fetch(`${API_URL}/primatransactions`),
        fetch(`${API_URL}/production`),
        fetch(`${API_URL}/purchases`),
        fetch(`${API_URL}/pettycash`),
        fetch(`${API_URL}/pettycash/summary`),
        fetch(`${API_URL}/expenses`)
      ]);

      setTransactions(await txRes.json());
      setProduction(await prodRes.json());
      setPurchases(await purchaseRes.json());
      const pettyData = await pettyRes.json();
      setPettyCash(pettyData);
      const pettySummary = await pettySummaryRes.json();
      setPettyCashSummary({ totalInflow: pettySummary.totalInflow, totalOutflow: pettySummary.totalOutflow, balance: pettySummary.balance, totalTransactions: pettyData.length });
      setExpenses(await expenseRes.json());
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch dashboard data", variant: "destructive" });
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalQuantity = purchases.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const pendingPayments = transactions.filter(tx => tx.paymentStatus === "Pending" || tx.paymentStatus === "Approved").reduce((sum, tx) => sum + tx.amount, 0);
  const paidAmount = transactions.filter(tx => tx.paymentStatus === "Paid").reduce((sum, tx) => sum + tx.amount, 0);
  const totalDryKilos = production.reduce((sum, p) => sum + p.kilosOut, 0);

  // Charts data
  const primaChartData = useMemo(() => {
    const redQty = purchases.filter(p => p.color === "red").reduce((sum, p) => sum + (p.quantity || 0), 0);
    const greenQty = purchases.filter(p => p.color === "green").reduce((sum, p) => sum + (p.quantity || 0), 0);
    return { labels: ["Red Bonnets", "Green Bonnets"], datasets: [{ label: "Quantity (kg)", data: [redQty, greenQty], backgroundColor: ["#EF4444", "#10B981"] }] };
  }, [purchases]);

  const pettyCashChartData = useMemo(() => {
    const inflow = pettyCash.filter(p => p.type === "inflow").reduce((sum, p) => sum + p.amount, 0);
    const outflow = pettyCash.filter(p => p.type === "outflow").reduce((sum, p) => sum + p.amount, 0);
    return { labels: ["Inflow", "Outflow"], datasets: [{ label: "Amount (Rs)", data: [inflow, outflow], backgroundColor: ["#10B981", "#EF4444"] }] };
  }, [pettyCash]);

  const expensesChartData = useMemo(() => {
    const categories = Array.from(new Set(expenses.map(exp => exp.category)));
    const data = categories.map(cat => expenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.cost, 0));
    const colors = ["#3B82F6", "#F59E0B", "#EF4444", "#10B981"];
    return { labels: categories, datasets: [{ label: "Expenses (Rs)", data, backgroundColor: colors }] };
  }, [expenses]);

  const productionChartData = useMemo(() => {
    const sorted = [...production].sort((a, b) => a.id - b.id);
    return {
      labels: sorted.map(p => `#${p.id}`),
      datasets: [
        { label: "Kilos Out", data: sorted.map(p => p.kilosOut), borderColor: "#10B981", backgroundColor: "#10B981", tension: 0.3 },
        { label: "Dry Kilos", data: sorted.map(p => p.kilosOut * DRY_RATIO), borderColor: "#3B82F6", backgroundColor: "#3B82F6", tension: 0.3 }
      ]
    };
  }, [production]);

  const chartOptions = { responsive: true, plugins: { legend: { position: "top" as const }, title: { display: true } } };
  const lineChartOptions = { ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: "Production Over Time" } } };

  const SummaryCard = ({ title, value, icon: Icon, description }: { title: string; value: string; icon: any; description: string }) => (
    <div className="bg-white/90 rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg lg:rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
        </div>
      </div>
      <h3 className="text-xs sm:text-sm lg:text-base font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs sm:text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-slate-50 space-y-4 sm:space-y-6 sm:ml-0 lg:sm:ml-64 transition-all duration-300">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-slate-200/50 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="opacity-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white opacity-0" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-xs sm:text-sm lg:text-base text-slate-600">
                Overview of purchases, production, payments, petty cash & expenses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <SummaryCard
          title="Total Quantity"
          value={`${totalQuantity} kg`}
          icon={Plus}
          description="Sum of all purchased materials"
        />
        <SummaryCard
          title="Pending Payments"
          value={`Rs ${pendingPayments.toLocaleString()}`}
          icon={Clock}
          description="Amount awaiting payment"
        />
        <SummaryCard
          title="Paid Amount"
          value={`Rs ${paidAmount.toLocaleString()}`}
          icon={DollarSign}
          description="Cash received"
        />
        <SummaryCard
          title="Total Dry Kilos"
          value={`${totalDryKilos.toFixed(2)} kg`}
          icon={Package}
          description="Usable stock after production"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Chart 1 */}
        <div className="bg-white/90 rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-800 mb-3 sm:mb-4">
            Purchase Quantities by Color
          </h3>
          <div className="h-48 sm:h-64 lg:h-80">
            <Bar
              data={primaChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: "Purchase Quantities by Color",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white/90 rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-800 mb-3 sm:mb-4">
            Petty Cash Overview
          </h3>
          <div className="h-48 sm:h-64 lg:h-80">
            <Bar
              data={pettyCashChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: "Petty Cash Inflow vs Outflow",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Chart 3 */}
        <div className="bg-white/90 rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-800 mb-3 sm:mb-4">
            Expenses by Category
          </h3>
          <div className="h-48 sm:h-64 lg:h-80">
            <Bar
              data={expensesChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: "Expenses by Category",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Chart 4 */}
        <div className="bg-white/90 rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibent text-slate-800 mb-3 sm:mb-4">
            Production Overview
          </h3>
          <div className="h-48 sm:h-64 lg:h-80">
            <Line
              data={productionChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                ...lineChartOptions,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;