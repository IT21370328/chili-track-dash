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
import Bills from "./pages/Bills";
import Salaries from "./pages/Salaries";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/purchasing" element={<Purchasing />} />
            <Route path="/petty-cash" element={<PettyCash />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/production" element={<Production />} />
            <Route path="/prima" element={<PrimaTransactions />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/salaries" element={<Salaries />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
