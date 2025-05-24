import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import StudentLayout from "../layouts/StudentLayout";
import { useAuth } from "../services/AuthContext";
import chatService from "../services/chatService";
import { FaUserTie, FaSpinner, FaPlus } from "react-icons/fa";

interface User {
  user_id: number;
  username: string;
  role: string;
  email?: string;
}

const StudentCreateChatBox: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const data = await chatService.getAllAdvisors();
        setAdvisors(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách cố vấn:", err);
        setError("Không thể tải danh sách cố vấn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, []);

  const handleCreateChatBox = async (advisorId: number) => {
    try {
      setCreating(true);
      // Sử dụng API POST /chat/boxes/:id
      const chatBox = await chatService.createChatBoxWithAdvisorId(advisorId);
      
      // Chuyển hướng đến trang chat với box mới được tạo
      navigate(`/advisor-chat/${chatBox.id}`);
    } catch (err) {
      console.error("Lỗi khi tạo box chat:", err);
      setError("Không thể tạo cuộc trò chuyện. Vui lòng thử lại sau.");
    } finally {
      setCreating(false);
    }
  };

  if (!currentUser || currentUser.role !== "student") {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-red-500">Bạn không có quyền truy cập trang này</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Chọn giảng viên để trò chuyện</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advisors.map(advisor => (
              <div key={advisor.user_id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 mr-3">
                    <FaUserTie size={24} />
                  </div>
                  <div>
                    <div className="font-medium">{advisor.username}</div>
                    <div className="text-xs text-gray-500">Giảng viên</div>
                  </div>
                </div>
                <button
                  onClick={() => handleCreateChatBox(advisor.user_id)}
                  disabled={creating}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 rounded flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaPlus className="mr-2" />
                  )}
                  {creating ? "Đang tạo..." : "Bắt đầu trò chuyện"}
                </button>
              </div>
            ))}
          </div>
        )}
        
        {advisors.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy giảng viên nào
          </div>
        )}
        
        <div className="mt-6">
          <button
            onClick={() => navigate("/advisor-chat")}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Quay lại
          </button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentCreateChatBox; 