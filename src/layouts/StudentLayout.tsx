import React, { useState } from "react";
import StudentSidebar from "./StudentSidebar";
import Header from "./Header";

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <StudentSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
      </div>
    </div>
  );
};

export default StudentLayout; 