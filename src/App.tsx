import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "./pages/ProtectedRoute"; 
// Pages
import Dashboard from "./pages/Dashboard";
import Purchasing from "./pages/Purchasing";
import PettyCash from "./pages/PettyCash";
import Expenses from "./pages/Expenses";
import Production from "./pages/Production";
import PrimaTransactions from "./pages/PrimaTransactions";
import Salaries from "./pages/Salaries";
import Logs from "./pages/AuditLogTracker";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Invoice from "./pages/NewInvoice";


// React Query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Login />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/purchasing" element={<Purchasing />} />
            <Route path="/petty-cash" element={<PettyCash />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/production" element={<Production />} />
            <Route path="/prima" element={<PrimaTransactions />} />
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="*" element={<NotFound />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
