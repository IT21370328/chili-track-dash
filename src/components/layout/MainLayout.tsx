import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="min-h-screen flex w-full bg-gray-100">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 sm:ml-64 transition-all duration-300">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
