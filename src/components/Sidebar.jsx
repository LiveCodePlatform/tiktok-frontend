import { NavLink } from "react-router-dom";
import {
  Menu,
  Package,
  ShoppingCart,
  Clock,
  BarChart3,
  User,
  LogOut,
  X,
  Store,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { to: "/products", icon: Package, label: "Stock Management" },
  { to: "/", icon: BarChart3, label: "Sales Report", end: true },
  { to: "/orders/history", icon: Clock, label: "Order History" },
];

function Sidebar({ isExpanded, onToggleExpand, isMobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Rail / Expanded Panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-50
          flex flex-col justify-between py-5 transition-all duration-300 ease-in-out select-none
          lg:static lg:z-auto
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isExpanded ? "w-64 px-4" : "w-20 px-3 items-center"}
        `}
      >
        {/* Top Header / Hamburger Menu & Branding */}
        <div className="w-full flex flex-col">
          <div
            className={`flex items-center mb-6 ${
              isExpanded ? "justify-between px-2" : "justify-center"
            }`}
          >
            {isExpanded ? (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src="/uedc.png"
                  alt="UEDC Logo"
                  className="w-9 h-9 rounded-xl object-contain shadow-sm flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-gray-900 text-base leading-tight truncate">
                    UEDC
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium truncate">
                    Sale Agent Hub
                  </span>
                </div>
              </div>
            ) : null}

            <button
              onClick={onToggleExpand}
              className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
              aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isExpanded ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2 w-full">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center rounded-xl transition-all duration-200
                  ${
                    isExpanded
                      ? `px-3.5 py-3 gap-3 w-full ${
                          isActive
                            ? "bg-[#ff5b00] text-white font-semibold shadow-md shadow-orange-500/25"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`
                      : `w-12 h-12 justify-center mx-auto ${
                          isActive
                            ? "bg-[#ff5b00] text-white shadow-md shadow-orange-500/25"
                            : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                        }`
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="text-sm truncate leading-none">
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Profile & Logout Section */}
        <div className="flex flex-col gap-2 w-full pt-4 border-t border-gray-100">
          {/* User Profile */}
          <div
            className={`flex items-center rounded-xl transition-colors cursor-pointer ${
              isExpanded
                ? "px-3 py-2.5 gap-3 hover:bg-gray-50 text-gray-700"
                : "w-10 h-10 justify-center mx-auto"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            {isExpanded && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-900 truncate leading-tight">
                  Sales Agent
                </span>
                <span className="text-[11px] text-emerald-600 font-medium leading-tight">
                  Online
                </span>
              </div>
            )}
          </div>

          {/* Logout / Exit Button */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to sign out?")) {
                window.location.href = "/";
              }
            }}
            className={`flex items-center rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors ${
              isExpanded
                ? "px-3.5 py-2.5 gap-3 w-full text-sm font-medium"
                : "w-10 h-10 justify-center mx-auto"
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="leading-none">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

