import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative">

        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div
          className={`
            flex-1 flex flex-col transition-all duration-300
            ${sidebarOpen ? "ml-64" : "ml-0"} sm:ml-64
          `}
        >
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
