import React, { useState } from "react";
import {
  FaHome,
  FaUsersCog,
  FaChartBar,
  FaClipboardList,
  FaUserGraduate,
  FaUserTie,
  FaFileAlt,
  FaCog,
  FaBars,
  FaChevronDown,
  FaChevronRight,
  FaFileExcel,
  FaEnvelope
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
        active ? "bg-blue-800" : "hover:bg-blue-800"
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
      className="flex items-center px-4 py-2 pl-12 hover:bg-blue-700 transition-colors"
    >
      <span className="mr-3 text-lg">{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

const AdminSidebar: React.FC<SidebarProps> = ({ sidebarOpen, toggleSidebar }) => {
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
      } bg-indigo-900 text-white flex flex-col transition-all duration-300 ease-in-out`}
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
            to="/admin"
          />
          <MenuItem
            icon={<FaUsersCog />}
            text="Quản lý người dùng"
            active={openSubmenus["users"]}
            hasSubmenu={sidebarOpen}
            sidebarOpen={sidebarOpen}
            onClick={() => toggleSubmenu("users")}
          />
          {sidebarOpen && openSubmenus["users"] && (
            <div>
              <SubmenuItem
                icon={<FaUserGraduate />}
                text="Sinh viên"
                to="/admin/students"
              />
              <SubmenuItem
                icon={<FaUserTie />}
                text="Cố vấn học tập"
                to="/admin/advisors"
              />
            </div>
          )}
          <MenuItem
            icon={<FaClipboardList />}
            text="Quản lý khóa học"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/admin/courses"
          />
          <MenuItem
            icon={<FaChartBar />}
            text="Thống kê báo cáo"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/admin/reports"
          />
          <MenuItem
            icon={<FaFileAlt />}
            text="Quản lý cảnh báo"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/academic-warning"
          />
          <MenuItem
            icon={<FaFileExcel />}
            text="Quản lý file Excel"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/admin/excel-files"
          />
          <MenuItem
            icon={<FaEnvelope />}
            text="Gửi email thông báo"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/admin/email-sender"
          />
          <MenuItem
            icon={<FaCog />}
            text="Cài đặt hệ thống"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/admin/settings"
          />
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar; 