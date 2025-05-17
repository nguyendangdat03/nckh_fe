import React, { useState } from "react";
import {
  FaHome,
  FaNewspaper,
  FaUser,
  FaBook,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaSignInAlt,
  FaBars,
  FaSearch,
  FaLaptop,
  FaInfoCircle,
} from "react-icons/fa";
import MainLayout from "../layouts/MainLayout";

const HomePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Menu Item 1 */}
        <MenuCard
          icon={
            <img
              src="/path/to/portal-icon.png"
              alt="Portal"
              className="w-20 h-20"
            />
          }
          title="Hệ thống một cửa"
          link="#"
        />

        {/* Menu Item 2 */}
        <MenuCard
          icon={<img src="/path/to/null" alt="null" className="w-20 h-20" />}
          title="Phản hồi"
          link="#"
        />

        {/* Menu Item 3 */}
        <MenuCard
          icon={
            <img
              src="/path/to/finance-icon.png"
              alt="Finance"
              className="w-20 h-20"
            />
          }
          title="Tài chính"
          link="#"
        />

        {/* Menu Item 4 */}
        <MenuCard
          icon={
            <img
              src="/path/to/schedule-icon.png"
              alt="Schedule"
              className="w-20 h-20"
            />
          }
          title="Lịch học"
          link="#"
        />

        {/* Menu Item 5 */}
        <MenuCard
          icon={
            <img
              src="/path/to/registration-icon.png"
              alt="Registration"
              className="w-20 h-20"
            />
          }
          title="Đăng ký học"
          link="#"
        />

        {/* Menu Item 6 */}
        <MenuCard
          icon={<img src="/path/to/null" alt="null" className="w-20 h-20" />}
          title="Thông tin chờ"
          link="#"
        />

        {/* Menu Item 7 */}
        <MenuCard
          icon={
            <img
              src="/path/to/online-icon.png"
              alt="Online"
              className="w-20 h-20"
            />
          }
          title="Khai hồ sơ trực tuyến"
          link="#"
        />
      </div>
    </MainLayout>
  );
};

// Menu Item Component for Sidebar
interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  hasSubmenu?: boolean;
  sidebarOpen?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  text,
  active = false,
  hasSubmenu = false,
  sidebarOpen = true,
}) => {
  return (
    <a
      href="#"
      className={`flex items-center px-4 py-3 ${
        active ? "bg-indigo-800" : "hover:bg-indigo-800"
      } transition-colors ${sidebarOpen ? "" : "justify-center"}`}
    >
      <span className={`${sidebarOpen ? "mr-3" : ""} text-xl`}>{icon}</span>
      {sidebarOpen && <span>{text}</span>}
      {hasSubmenu && sidebarOpen && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 ml-auto"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </a>
  );
};

// Menu Card Component for Grid
interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  link: string;
}

const MenuCard: React.FC<MenuCardProps> = ({ icon, title, link }) => {
  return (
    <a
      href={link}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col items-center p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-center text-indigo-900 font-medium">{title}</h3>
      </div>
    </a>
  );
};

export default HomePage;
