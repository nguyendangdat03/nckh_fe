import React from "react";
import AdvisorLayout from "../layouts/AdvisorLayout";
import { FaUserGraduate, FaExclamationTriangle, FaComments, FaCalendarAlt, FaChartLine, FaClipboardCheck } from "react-icons/fa";

const AdvisorPage: React.FC = () => {
  return (
    <AdvisorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-900 mb-6">Cố vấn học tập</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <MenuCard
            icon={<FaUserGraduate className="w-16 h-16 text-indigo-600" />}
            title="Danh sách sinh viên"
            link="#"
          />
          
          <MenuCard
            icon={<FaExclamationTriangle className="w-16 h-16 text-indigo-600" />}
            title="Cảnh báo học tập"
            link="/academic-warning"
          />
          
          <MenuCard
            icon={<FaComments className="w-16 h-16 text-indigo-600" />}
            title="Tư vấn trực tuyến"
            link="/advisor-chat"
          />
          
          <MenuCard
            icon={<FaCalendarAlt className="w-16 h-16 text-indigo-600" />}
            title="Lịch gặp sinh viên"
            link="#"
          />
          
          <MenuCard
            icon={<FaChartLine className="w-16 h-16 text-indigo-600" />}
            title="Thống kê kết quả học tập"
            link="#"
          />
          
          <MenuCard
            icon={<FaClipboardCheck className="w-16 h-16 text-indigo-600" />}
            title="Báo cáo định kỳ"
            link="#"
          />
        </div>
      </div>
    </AdvisorLayout>
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

export default AdvisorPage; 