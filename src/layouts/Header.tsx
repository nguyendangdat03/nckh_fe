import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaSearch } from "react-icons/fa";
import { useAuth } from "../services/AuthContext";

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  return (
    <div className="bg-indigo-900 text-white h-16 flex items-center justify-between px-4">
      <div className="flex items-center">
        <div className="sm:hidden mr-4 cursor-pointer" onClick={toggleSidebar}>
          <FaBars size={20} />
        </div>
        <h1 className="text-xl font-semibold">
          {user ? `Xin chào, ${user.username}!` : "Xin chào!"}
        </h1>
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
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center overflow-hidden">
              {user?.username ? (
                <span className="text-indigo-900 font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span>U</span>
              )}
            </div>
            <span className="mr-1">{user?.username || "Người dùng"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
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

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-900">{user?.username || "Người dùng"}</p>
                <p className="text-xs text-gray-600">{user?.email || ""}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-1 capitalize">
                  {user?.role === 'admin' ? 'Quản trị viên' : 
                   user?.role === 'advisor' ? 'Cố vấn học tập' : 
                   user?.role === 'student' ? 'Sinh viên' : 'Người dùng'}
                </p>
              </div>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Thông tin tài khoản
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Cài đặt
              </a>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
