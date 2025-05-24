import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdvisorLayout from "../layouts/AdvisorLayout";
import StudentLayout from "../layouts/StudentLayout";
import { useAuth } from "../services/AuthContext";
import { FaComments, FaUserFriends, FaPlus, FaRocket, FaUserTie } from "react-icons/fa";

const ChatPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Tự động chuyển hướng đến trang chat giữa sinh viên và cố vấn
  useEffect(() => {
    // Tự động chuyển hướng sau 5 giây nếu không có tương tác
    const timer = setTimeout(() => {
      navigate("/advisor-chat");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoToChat = () => {
    navigate("/advisor-chat");
  };

  const handleNewChat = () => {
    navigate("/new-chat");
  };
  
  const handleCreateSimpleChat = () => {
    navigate("/create-chat");
  };
  
  const handleStudentCreateChat = () => {
    navigate("/student-create-chat");
  };

  // Sử dụng layout phù hợp với vai trò người dùng
  const Layout = currentUser?.role === "advisor" ? AdvisorLayout : 
               currentUser?.role === "student" ? StudentLayout : MainLayout;

  return (
    <Layout>
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
          <div className="text-6xl text-indigo-600 mb-4 flex justify-center">
            <FaComments />
        </div>
          <h1 className="text-2xl font-bold mb-4">Hệ thống nhắn tin mới</h1>
          <p className="text-gray-600 mb-6">
            Chúng tôi đã nâng cấp hệ thống nhắn tin. Giờ đây bạn có thể trò chuyện trực tiếp với 
            {currentUser?.role === "student" ? " giảng viên" : " sinh viên"} của mình.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoToChat}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 flex items-center justify-center"
            >
              <FaUserFriends className="mr-2" />
              Xem cuộc trò chuyện
            </button>
            
            <button
              onClick={handleCreateSimpleChat}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center"
            >
              <FaRocket className="mr-2" />
              Tạo chat nhanh
            </button>
            
            {currentUser?.role === "student" && (
              <button
                onClick={handleStudentCreateChat}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 flex items-center justify-center"
              >
                <FaUserTie className="mr-2" />
                Nhắn tin với giảng viên
              </button>
            )}
            
                <button
              onClick={handleNewChat}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Tạo cuộc trò chuyện (nâng cao)
                </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Đang chuyển hướng tự động đến hệ thống nhắn tin mới...
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
