import React, { useState } from "react";
import {
  FaHome,
  FaUserGraduate,
  FaExclamationTriangle,
  FaComments,
  FaCalendarAlt,
  FaChartLine,
  FaClipboardCheck,
  FaBars,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

// Menu Item Component for Sidebar
interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  hasSubmenu?: boolean;
  sidebarOpen?: boolean;
  to?: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  text,
  active = false,
  hasSubmenu = false,
  sidebarOpen = true,
  to = "#",
  onClick,
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 ${
        active ? "bg-green-800" : "hover:bg-green-800"
      } transition-colors ${sidebarOpen ? "" : "justify-center"}`}
      onClick={onClick}
    >
      <span className={`${sidebarOpen ? "mr-3" : ""} text-xl`}>{icon}</span>
      {sidebarOpen && <span>{text}</span>}
      {hasSubmenu && sidebarOpen && (
        <span className="ml-auto">
          {active ? (
            <FaChevronDown className="h-4 w-4" />
          ) : (
            <FaChevronRight className="h-4 w-4" />
          )}
        </span>
      )}
    </Link>
  );
};

// Submenu Item Component
interface SubmenuItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
}

const SubmenuItem: React.FC<SubmenuItemProps> = ({ icon, text, to }) => {
  return (
    <Link
      to={to}
      className="flex items-center px-4 py-2 pl-12 hover:bg-green-700 transition-colors"
    >
      <span className="mr-3 text-lg">{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

const AdvisorSidebar: React.FC<SidebarProps> = ({ sidebarOpen, toggleSidebar }) => {
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-16"
      } bg-green-900 text-white flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div
        className={`p-4 flex ${
          sidebarOpen ? "justify-center" : "justify-center"
        }`}
      >
        <img
          src="img/image.png"
          alt="HUNRE Logo"
          className={`${
            sidebarOpen ? "w-32 h-32" : "w-10 h-10"
          } rounded-full transition-all duration-300`}
        />
      </div>

      {/* Menu Items */}
      <div className="flex-1">
        <nav className="mt-2">
          <div onClick={toggleSidebar} className="cursor-pointer">
            <MenuItem
              icon={<FaBars />}
              text=""
              active={false}
              sidebarOpen={sidebarOpen}
            />
          </div>
          <MenuItem
            icon={<FaHome />}
            text="Trang chủ"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/advisor"
          />
          <MenuItem
            icon={<FaUserGraduate />}
            text="Danh sách sinh viên"
            active={openSubmenus["students"]}
            hasSubmenu={sidebarOpen}
            sidebarOpen={sidebarOpen}
            onClick={() => toggleSubmenu("students")}
          />
          {sidebarOpen && openSubmenus["students"] && (
            <div>
              <SubmenuItem
                icon={<FaUserGraduate />}
                text="Tất cả sinh viên"
                to="/advisor/students"
              />
              <SubmenuItem
                icon={<FaExclamationTriangle />}
                text="Sinh viên cảnh báo"
                to="/advisor/warning-students"
              />
            </div>
          )}
          <MenuItem
            icon={<FaExclamationTriangle />}
            text="Cảnh báo học tập"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/academic-warning"
          />
          <MenuItem
            icon={<FaComments />}
            text="Tư vấn trực tuyến"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/chat"
          />
          <MenuItem
            icon={<FaCalendarAlt />}
            text="Lịch gặp sinh viên"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/advisor/schedule"
          />
          <MenuItem
            icon={<FaChartLine />}
            text="Thống kê kết quả"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/advisor/statistics"
          />
          <MenuItem
            icon={<FaClipboardCheck />}
            text="Báo cáo định kỳ"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/advisor/reports"
          />
        </nav>
      </div>
    </div>
  );
};

export default AdvisorSidebar; 