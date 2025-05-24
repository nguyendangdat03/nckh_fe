import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdvisorLayout from "../layouts/AdvisorLayout";
import StudentLayout from "../layouts/StudentLayout";
import { useAuth } from "../services/AuthContext";
import chatService from "../services/chatService";
import { FaComments, FaSpinner, FaUserCircle, FaPlus } from "react-icons/fa";

interface User {
  user_id: number;
  username: string;
  role: string;
  email?: string;
  student_code?: string;
}

const CreateChatBox: React.FC = () => {
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

  const handleCreateChat = async (advisorId: number) => {
    try {
      setCreating(true);
      
      // Gọi API để tạo box chat với cố vấn
      let chatBox;
      
      if (currentUser?.role === "student") {
        // Sử dụng API POST /chat/boxes/:id cho sinh viên
        chatBox = await chatService.createChatBoxWithAdvisorId(advisorId);
      } else {
        // Sử dụng API POST /chat/boxes cho cố vấn
        if (!currentUser?.user_id) {
          throw new Error("Không có thông tin người dùng");
        }
        
        // Lấy thông tin sinh viên (giả sử advisorId là student_id trong trường hợp này)
        chatBox = await chatService.createChatBox(advisorId, currentUser.user_id);
      }
      
      // Chuyển hướng đến trang chat với box mới được tạo
      navigate(`/advisor-chat/${chatBox.id}`);
    } catch (err) {
      console.error("Lỗi khi tạo box chat:", err);
      setError("Không thể tạo cuộc trò chuyện. Vui lòng thử lại sau.");
    } finally {
      setCreating(false);
    }
  };

  if (!currentUser) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-red-500">Vui lòng đăng nhập để tiếp tục</div>
        </div>
      </MainLayout>
    );
  }

  // Sử dụng layout phù hợp với vai trò người dùng
  const Layout = currentUser?.role === "advisor" ? AdvisorLayout : 
               currentUser?.role === "student" ? StudentLayout : MainLayout;

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-indigo-900">Tạo cuộc trò chuyện mới</h1>
        
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
          <>
            <h2 className="text-xl font-semibold mb-4">
              Chọn {currentUser.role === "student" ? "giảng viên" : "sinh viên"} để bắt đầu trò chuyện:
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advisors.map(advisor => (
                <div 
                  key={advisor.user_id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 mr-3">
                      <FaUserCircle size={24} />
                    </div>
                    <div>
                      <div className="font-medium">{advisor.username}</div>
                      {advisor.student_code && (
                        <div className="text-xs text-gray-500">Mã: {advisor.student_code}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        {advisor.role === "advisor" ? "Giảng viên" : "Sinh viên"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => !creating && handleCreateChat(advisor.user_id)}
                    disabled={creating}
                    className="mt-2 w-full bg-indigo-600 text-white py-2 px-3 rounded flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaPlus className="mr-2" />
                    )}
                    {creating ? "Đang tạo..." : "Tạo cuộc trò chuyện"}
                  </button>
                </div>
              ))}
            </div>
            
            {advisors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không có {currentUser.role === "student" ? "giảng viên" : "sinh viên"} nào được tìm thấy
              </div>
            )}
          </>
        )}
        
        {creating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
              <FaSpinner className="animate-spin text-indigo-600 mr-3" size={24} />
              <div>Đang tạo cuộc trò chuyện...</div>
            </div>
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
    </Layout>
  );
};

export default CreateChatBox; 