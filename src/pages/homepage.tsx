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

const HomePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
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
              active={true}
              sidebarOpen={sidebarOpen}
            />
            <MenuItem
              icon={<FaNewspaper />}
              text="Tin tức"
              active={false}
              sidebarOpen={sidebarOpen}
            />
            <MenuItem
              icon={<FaUser />}
              text="Profile"
              active={false}
              hasSubmenu={sidebarOpen}
              sidebarOpen={sidebarOpen}
            />
            <MenuItem
              icon={<FaBook />}
              text="Góc học tập"
              active={false}
              hasSubmenu={sidebarOpen}
              sidebarOpen={sidebarOpen}
            />
            <MenuItem
              icon={<FaSignInAlt />}
              text="Đăng ký trực tuyến"
              active={false}
              hasSubmenu={sidebarOpen}
              sidebarOpen={sidebarOpen}
            />
            <MenuItem
              icon={<FaCalendarAlt />}
              text="Thời khóa biểu"
              active={false}
              hasSubmenu={sidebarOpen}
              sidebarOpen={sidebarOpen}
            />
            <MenuItem
              icon={<FaMoneyBillWave />}
              text="Tài chính"
              active={false}
              hasSubmenu={sidebarOpen}
              sidebarOpen={sidebarOpen}
            />
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="bg-indigo-900 text-white h-16 flex items-center justify-between px-4">
          <div className="flex items-center">
            <div
              className="sm:hidden mr-4 cursor-pointer"
              onClick={toggleSidebar}
            >
              <FaBars size={20} />
            </div>
            <h1 className="text-xl font-semibold">Xin chào!</h1>
          </div>

          <div className="flex items-center">
            {/* Search Bar */}
            <div className="relative mr-4">
              <input
                type="text"
                placeholder="Tìm kiếm thông tin"
                className="bg-indigo-800 text-white rounded-full py-2 px-4 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-300" />
            </div>

            {/* User Profile */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
              <span className="mr-1">Nguyễn Đăng Đạt</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 bg-blue-100 p-6 overflow-auto">
          {/* Menu Grid - Adjust grid columns based on sidebar state */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              sidebarOpen
                ? "md:grid-cols-3 lg:grid-cols-4"
                : "md:grid-cols-4 lg:grid-cols-5"
            } gap-6`}
          >
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
              icon={
                <img src="/path/to/null" alt="null" className="w-20 h-20" />
              }
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
              icon={
                <img src="/path/to/null" alt="null" className="w-20 h-20" />
              }
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
        </div>
      </div>
    </div>
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
