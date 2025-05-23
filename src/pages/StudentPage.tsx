import React from "react";
import StudentLayout from "../layouts/StudentLayout";
import { FaGraduationCap, FaCalendarAlt, FaExclamationTriangle, FaComments, FaMoneyBillWave, FaFileAlt } from "react-icons/fa";

const StudentPage: React.FC = () => {
  return (
    <StudentLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-900 mb-6">Sinh viên</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <MenuCard
            icon={<FaGraduationCap className="w-16 h-16 text-indigo-600" />}
            title="Kết quả học tập"
            link="#"
          />
          
          <MenuCard
            icon={<FaCalendarAlt className="w-16 h-16 text-indigo-600" />}
            title="Thời khóa biểu"
            link="#"
          />
          
          <MenuCard
            icon={<FaExclamationTriangle className="w-16 h-16 text-indigo-600" />}
            title="Cảnh báo học tập"
            link="/academic-warning"
          />
          
          <MenuCard
            icon={<FaComments className="w-16 h-16 text-indigo-600" />}
            title="Tư vấn với CVHT"
            link="/chat"
          />
          
          <MenuCard
            icon={<FaMoneyBillWave className="w-16 h-16 text-indigo-600" />}
            title="Học phí"
            link="#"
          />
          
          <MenuCard
            icon={<FaFileAlt className="w-16 h-16 text-indigo-600" />}
            title="Đăng ký học phần"
            link="#"
          />
        </div>
      </div>
    </StudentLayout>
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

export default StudentPage; 