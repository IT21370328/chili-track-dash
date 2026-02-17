import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Purchasing from "./pages/Purchasing";
import PettyCash from "./pages/PettyCash";
import Expenses from "./pages/Expenses";
import Production from "./pages/Production";
import PrimaTransactions from "./pages/PrimaTransactions";
import Salaries from "./pages/Salaries";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Logs from "./pages/AuditLogTracker";
import Labels from "./pages/ProductLabels"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Login page does NOT use MainLayout */}
          <Route path="/" element={<Login />} />

          {/* All other routes are wrapped in MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/purchasing" element={<Purchasing />} />
            <Route path="/petty-cash" element={<PettyCash />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/production" element={<Production />} />
            <Route path="/prima" element={<PrimaTransactions />} />
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/labels" element={<Labels />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="*" element={<NotFound />} />

          </Route>
        </Routes>
      </BrowserRouter>
  </QueryClientProvider>
);

export default App;
