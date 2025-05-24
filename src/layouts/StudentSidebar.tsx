import React, { useState } from "react";
import {
  FaHome,
  FaGraduationCap,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaComments,
  FaMoneyBillWave,
  FaFileAlt,
  FaUser,
  FaBars,
  FaChevronDown,
  FaChevronRight,
  FaCommentDots,
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
        active ? "bg-indigo-800" : "hover:bg-indigo-800"
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
      className="flex items-center px-4 py-2 pl-12 hover:bg-indigo-700 transition-colors"
    >
      <span className="mr-3 text-lg">{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

const StudentSidebar: React.FC<SidebarProps> = ({ sidebarOpen, toggleSidebar }) => {
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
            to="/student"
          />
          <MenuItem
            icon={<FaUser />}
            text="Thông tin cá nhân"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/student/profile"
          />
          <MenuItem
            icon={<FaGraduationCap />}
            text="Kết quả học tập"
            active={openSubmenus["learning"]}
            hasSubmenu={sidebarOpen}
            sidebarOpen={sidebarOpen}
            onClick={() => toggleSubmenu("learning")}
          />
          {sidebarOpen && openSubmenus["learning"] && (
            <div>
              <SubmenuItem
                icon={<FaGraduationCap />}
                text="Bảng điểm"
                to="/student/grades"
              />
              <SubmenuItem
                icon={<FaExclamationTriangle />}
                text="Cảnh báo học tập"
                to="/academic-warning"
              />
            </div>
          )}
          <MenuItem
            icon={<FaCalendarAlt />}
            text="Thời khóa biểu"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/student/schedule"
          />
          <MenuItem
            icon={<FaCommentDots />}
            text="Nhắn tin với cố vấn"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/advisor-chat"
          />
          <MenuItem
            icon={<FaMoneyBillWave />}
            text="Học phí"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/student/tuition"
          />
          <MenuItem
            icon={<FaFileAlt />}
            text="Đăng ký học phần"
            active={false}
            sidebarOpen={sidebarOpen}
            to="/student/registration"
          />
        </nav>
      </div>
    </div>
  );
};

export default StudentSidebar; 