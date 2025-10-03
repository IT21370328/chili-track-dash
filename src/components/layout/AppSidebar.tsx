import { 
  Home, 
  ShoppingCart, 
  Wallet, 
  Receipt, 
  Factory, 
  Truck, 
  FileText, 
  Users,
  Menu,
  X
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import Logo from "../../assets/logo.jpg";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Purchasing", url: "/purchasing", icon: ShoppingCart },
  { title: "Petty Cash", url: "/petty-cash", icon: Wallet },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Production", url: "/production", icon: Factory },
  { title: "Prima Delivery", url: "/prima", icon: Truck },
  { title: "Employee Salaries", url: "/salaries", icon: Users },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button for Mobile */}
      <button
        className="fixed top-4 left-4 z-50 sm:hidden p-2 rounded-md bg-gray-900 text-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white shadow-lg flex flex-col transform transition-transform duration-300 sm:hidden z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-700 pt-[50px]">
          <img src={Logo} alt="Logo" className="w-10 h-10 object-cover rounded-sm" />
          <div>
            <h2 className="font-bold text-lg">Ma's De Cozta</h2>
            <p className="text-xs text-gray-400">Production Tracking System</p>
          </div>
        </div>

        <nav className="flex-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              to={item.url}
              key={item.title}
              className={({ isActive }) =>
                `flex items-center gap-3 p-5 mx-2 rounded-xl transition-all duration-300
                 ${isActive ? "bg-blue-700 text-white shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link to="/">
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-800 transition-all duration-300">
              <FileText className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Desktop Sidebar (always visible, no overlay) */}
      <div className="hidden sm:flex sm:flex-col sm:fixed sm:top-0 sm:left-0 sm:h-screen sm:w-64 bg-gray-900 text-white shadow-lg z-40">
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <img src={Logo} alt="Logo" className="w-10 h-10 object-cover rounded-sm" />
          <div>
            <h2 className="font-bold text-lg">Ma's De Cozta</h2>
            <p className="text-xs text-gray-400">Production Tracking System</p>
          </div>
        </div>

        <nav className="flex-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              to={item.url}
              key={item.title}
              className={({ isActive }) =>
                `flex items-center gap-3 p-5 mx-2 rounded-xl transition-all duration-300
                 ${isActive ? "bg-blue-700 text-white shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link to="/">
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-800 transition-all duration-300">
              <FileText className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Overlay only for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 sm:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
