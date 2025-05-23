import React from "react";
import AdminLayout from "../layouts/AdminLayout";
import { FaUsersCog, FaChartBar, FaClipboardList, FaUserGraduate, FaUserTie, FaFileAlt } from "react-icons/fa";

const AdminPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-900 mb-6">Quản trị hệ thống</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <MenuCard
            icon={<FaUsersCog className="w-16 h-16 text-indigo-600" />}
            title="Quản lý người dùng"
            link="#"
          />
          
          <MenuCard
            icon={<FaChartBar className="w-16 h-16 text-indigo-600" />}
            title="Thống kê báo cáo"
            link="#"
          />
          
          <MenuCard
            icon={<FaClipboardList className="w-16 h-16 text-indigo-600" />}
            title="Quản lý khóa học"
            link="#"
          />
          
          <MenuCard
            icon={<FaUserGraduate className="w-16 h-16 text-indigo-600" />}
            title="Quản lý sinh viên"
            link="#"
          />
          
          <MenuCard
            icon={<FaUserTie className="w-16 h-16 text-indigo-600" />}
            title="Quản lý cố vấn"
            link="#"
          />
          
          <MenuCard
            icon={<FaFileAlt className="w-16 h-16 text-indigo-600" />}
            title="Quản lý cảnh báo học tập"
            link="#"
          />
        </div>
      </div>
    </AdminLayout>
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

export default AdminPage; 