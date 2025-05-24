import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/homepage";
import AcademicWarning from "./pages/AcademicWarning";
import AdminPage from "./pages/AdminPage";
import AdvisorPage from "./pages/AdvisorPage";
import StudentPage from "./pages/StudentPage";
import LoginPage from "./pages/loginpage";
import ChatPage from "./pages/chat";
import AdvisorChat from "./pages/advisorChat";
import NewChatBox from "./components/NewChatBox";
import CreateChatBox from "./pages/CreateChatBox";
import StudentCreateChatBox from "./pages/StudentCreateChatBox";
import ExcelFilesManager from "./pages/admin/ExcelFilesManager";
import EmailSender from "./pages/admin/EmailSender";
import { BubbleChat } from "flowise-embed-react";
import { AuthProvider } from "./services/AuthContext";
import { setupAxiosInterceptors } from "./services/authService";
import "./App.css";

// Route bảo vệ có quyền truy cập
const ProtectedRoute = ({ element, allowedRoles }: { element: React.ReactNode, allowedRoles: string[] }) => {
  const userStr = localStorage.getItem('user');
  const isAuthenticated = localStorage.getItem('access_token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (allowedRoles.includes(user.role)) {
        return <>{element}</>;
      }
      
      // Nếu không có quyền, chuyển hướng đến trang mặc định của vai trò
      if (user.role === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (user.role === 'advisor') {
        return <Navigate to="/advisor" replace />;
      } else if (user.role === 'student') {
        return <Navigate to="/student" replace />;
      }
    } catch (error) {
      console.error('Lỗi khi parse thông tin người dùng:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      return <Navigate to="/login" replace />;
    }
  }
  
  return <Navigate to="/login" replace />;
};

function App() {
  useEffect(() => {
    // Thiết lập interceptors Axios khi ứng dụng khởi động
    console.log('Thiết lập Axios interceptors');
    setupAxiosInterceptors();
  }, []);

  return (
    <div className="app-container w-full h-full overflow-hidden">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Trang đăng nhập */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Trang chung */}
            <Route path="/home" element={<ProtectedRoute element={<HomePage />} allowedRoles={['admin', 'advisor', 'student']} />} />
            
            {/* Trang trợ lý ảo */}
            <Route path="/chat" element={<ProtectedRoute element={<ChatPage />} allowedRoles={['admin', 'advisor', 'student']} />} />
            
            {/* Trang nhắn tin giữa sinh viên và cố vấn */}
            <Route path="/advisor-chat" element={<ProtectedRoute element={<AdvisorChat />} allowedRoles={['advisor', 'student']} />} />
            <Route path="/advisor-chat/:id" element={<ProtectedRoute element={<AdvisorChat />} allowedRoles={['advisor', 'student']} />} />
            <Route path="/new-chat" element={<ProtectedRoute element={<NewChatBox />} allowedRoles={['advisor', 'student']} />} />
            <Route path="/create-chat" element={<ProtectedRoute element={<CreateChatBox />} allowedRoles={['advisor', 'student']} />} />
            <Route path="/student-create-chat" element={<ProtectedRoute element={<StudentCreateChatBox />} allowedRoles={['student']} />} />
            
            {/* Trang cảnh báo học tập - ai cũng có thể xem nhưng quyền khác nhau */}
            <Route path="/academic-warning" element={<ProtectedRoute element={<AcademicWarning />} allowedRoles={['admin', 'advisor', 'student']} />} />

            {/* Trang Admin */}
            <Route path="/admin" element={<ProtectedRoute element={<AdminPage />} allowedRoles={['admin']} />} />
            <Route path="/admin/students" element={<ProtectedRoute element={<div>Quản lý sinh viên</div>} allowedRoles={['admin']} />} />
            <Route path="/admin/advisors" element={<ProtectedRoute element={<div>Quản lý cố vấn</div>} allowedRoles={['admin']} />} />
            <Route path="/admin/courses" element={<ProtectedRoute element={<div>Quản lý khóa học</div>} allowedRoles={['admin']} />} />
            <Route path="/admin/reports" element={<ProtectedRoute element={<div>Báo cáo thống kê</div>} allowedRoles={['admin']} />} />
            <Route path="/admin/warnings" element={<ProtectedRoute element={<AcademicWarning />} allowedRoles={['admin']} />} />
            <Route path="/admin/settings" element={<ProtectedRoute element={<div>Cài đặt hệ thống</div>} allowedRoles={['admin']} />} />
            <Route path="/admin/excel-files" element={<ProtectedRoute element={<ExcelFilesManager />} allowedRoles={['admin']} />} />
            <Route path="/admin/email-sender" element={<ProtectedRoute element={<EmailSender />} allowedRoles={['admin']} />} />

            {/* Trang Cố vấn học tập */}
            <Route path="/advisor" element={<ProtectedRoute element={<AdvisorPage />} allowedRoles={['advisor']} />} />
            <Route path="/advisor/students" element={<ProtectedRoute element={<div>Danh sách sinh viên</div>} allowedRoles={['advisor']} />} />
            <Route path="/advisor/warning-students" element={<ProtectedRoute element={<AcademicWarning />} allowedRoles={['advisor']} />} />
            <Route path="/advisor/schedule" element={<ProtectedRoute element={<div>Lịch gặp sinh viên</div>} allowedRoles={['advisor']} />} />
            <Route path="/advisor/statistics" element={<ProtectedRoute element={<div>Thống kê kết quả</div>} allowedRoles={['advisor']} />} />
            <Route path="/advisor/reports" element={<ProtectedRoute element={<div>Báo cáo định kỳ</div>} allowedRoles={['advisor']} />} />
            
            {/* Trang Sinh viên */}
            <Route path="/student" element={<ProtectedRoute element={<StudentPage />} allowedRoles={['student']} />} />
            <Route path="/student/profile" element={<ProtectedRoute element={<div>Thông tin cá nhân</div>} allowedRoles={['student']} />} />
            <Route path="/student/grades" element={<ProtectedRoute element={<div>Bảng điểm</div>} allowedRoles={['student']} />} />
            <Route path="/student/warnings" element={<ProtectedRoute element={<AcademicWarning />} allowedRoles={['student']} />} />
            <Route path="/student/schedule" element={<ProtectedRoute element={<div>Thời khóa biểu</div>} allowedRoles={['student']} />} />
            <Route path="/student/tuition" element={<ProtectedRoute element={<div>Học phí</div>} allowedRoles={['student']} />} />
            <Route path="/student/registration" element={<ProtectedRoute element={<div>Đăng ký học phần</div>} allowedRoles={['student']} />} />
          </Routes>
        </AuthProvider>
      </Router>

      {/* Sử dụng BubbleChat từ flowise-embed-react */}
      <BubbleChat
        chatflowid="ec69ee4d-b630-486c-8642-a915e2b45322"
        apiHost="http://localhost:3301"
        theme={{
          chatWindow: {
            welcomeMessage:
              "Xin chào! Tôi là trợ lý ảo HUNRE. Bạn cần hỗ trợ gì?",
            backgroundColor: "#ffffff",
            height: 450,
            width: 350,
            fontSize: 14,
            poweredByTextColor: "#303235",
            botMessage: {
              backgroundColor: "#f7f8ff",
              textColor: "#303235",
              showAvatar: true,
              avatarSrc:
                "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
            },
            userMessage: {
              backgroundColor: "#3B81F6",
              textColor: "#ffffff",
              showAvatar: true,
              avatarSrc:
                "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
            },
            textInput: {
              placeholder: "Nhập tin nhắn...",
              backgroundColor: "#ffffff",
              textColor: "#303235",
              sendButtonColor: "#3B81F6",
            },
          },
          button: {
            size: "medium",
            backgroundColor: "#3B81F6",
            iconColor: "#ffffff",
            bottom: 20,
            right: 20,
          },
        }}
      />
    </div>
  );
}

export default App;
