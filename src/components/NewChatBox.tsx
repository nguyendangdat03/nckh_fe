import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import chatService from "../services/chatService";
import { FaComments, FaSpinner } from "react-icons/fa";

interface User {
  user_id: number;
  username: string;
  role: string;
  email?: string;
  student_code?: string;
}

const NewChatBox: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        if (!currentUser) return;
        
        let usersList: User[] = [];
        if (currentUser.role === "advisor") {
          // Giảng viên - lấy danh sách sinh viên
          usersList = await chatService.getAllStudents();
        } else if (currentUser.role === "student") {
          // Sinh viên - lấy danh sách giảng viên
          usersList = await chatService.getAllAdvisors();
        }
        setUsers(usersList);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        setError("Có lỗi xảy ra khi tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser]);

  const handleCreateChatBox = async () => {
    if (!selectedUserId || !currentUser) return;
    
    setCreating(true);
    setError(null);
    
    try {
      let studentId: number;
      let advisorId: number;
      
      if (currentUser.role === "student") {
        studentId = currentUser.user_id;
        advisorId = selectedUserId;
      } else {
        advisorId = currentUser.user_id;
        studentId = selectedUserId;
      }
      
      // Tạo chat box mới
      const chatBox = await chatService.createChatBox(studentId, advisorId);
      
      // Chuyển hướng đến trang chat với box mới được tạo
      navigate(`/advisor-chat/${chatBox.id}`);
    } catch (error) {
      console.error("Lỗi khi tạo box chat:", error);
      setError("Không thể tạo cuộc trò chuyện. Vui lòng thử lại sau.");
    } finally {
      setCreating(false);
    }
  };

  const getUserDisplayName = (user: User): string => {
    if (user.student_code) {
      return `${user.username} (${user.student_code})`;
    }
    return user.username;
  };

  if (!currentUser) {
    return <div>Vui lòng đăng nhập để tiếp tục</div>;
  }

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-6">
        <FaComments className="text-indigo-600 text-4xl mr-3" />
        <h2 className="text-2xl font-semibold text-gray-800">
          Tạo cuộc trò chuyện mới
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Chọn {currentUser.role === "student" ? "giảng viên" : "sinh viên"}:
        </label>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <FaSpinner className="animate-spin text-indigo-600" size={24} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-gray-500 italic">
            Không có {currentUser.role === "student" ? "giảng viên" : "sinh viên"} nào để hiển thị
          </div>
        ) : (
          <select
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedUserId || ""}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
          >
            <option value="">-- Chọn --</option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {getUserDisplayName(user)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => navigate("/advisor-chat")}
          className="mr-2 px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          Hủy
        </button>
        <button
          onClick={handleCreateChatBox}
          disabled={!selectedUserId || creating}
          className={`px-4 py-2 text-white bg-indigo-600 rounded flex items-center ${
            !selectedUserId || creating ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
          }`}
        >
          {creating ? <FaSpinner className="animate-spin mr-2" /> : null}
          Tạo cuộc trò chuyện
        </button>
      </div>
    </div>
  );
};

export default NewChatBox; 