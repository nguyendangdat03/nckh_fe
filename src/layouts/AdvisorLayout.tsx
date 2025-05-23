import React, { useState } from "react";
import AdvisorSidebar from "./AdvisorSidebar";
import Header from "./Header";

interface AdvisorLayoutProps {
  children: React.ReactNode;
}

const AdvisorLayout: React.FC<AdvisorLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <AdvisorSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
      </div>
    </div>
  );
};

export default AdvisorLayout; 