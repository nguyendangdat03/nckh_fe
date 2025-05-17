import React from "react";
import { FaBars, FaSearch } from "react-icons/fa";

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <div className="bg-indigo-900 text-white h-16 flex items-center justify-between px-4">
      <div className="flex items-center">
        <div className="sm:hidden mr-4 cursor-pointer" onClick={toggleSidebar}>
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
  );
};

export default Header;
