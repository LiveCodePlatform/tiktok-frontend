import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      <Sidebar
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 lg:p-6 w-full max-w-[1600px] mx-auto h-full flex flex-col min-h-0 overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

