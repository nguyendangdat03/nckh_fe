import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/homepage";
import ChatPage from "./pages/chat";
import AcademicWarning from "./pages/AcademicWarning";
import AdminPage from "./pages/AdminPage";
import AdvisorPage from "./pages/AdvisorPage";
import StudentPage from "./pages/StudentPage";
import LoginPage from "./pages/loginpage";
import { BubbleChat } from "flowise-embed-react";
import "./App.css";

function App() {
  return (
    <div className="app-container w-full h-full overflow-hidden">
      <Router>
        <Routes>
          {/* Trang đăng nhập */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Trang chung */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/academic-warning" element={<AcademicWarning />} />

          {/* Trang Admin */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/students" element={<div>Quản lý sinh viên</div>} />
          <Route path="/admin/advisors" element={<div>Quản lý cố vấn</div>} />
          <Route path="/admin/courses" element={<div>Quản lý khóa học</div>} />
          <Route path="/admin/reports" element={<div>Báo cáo thống kê</div>} />
          <Route path="/admin/warnings" element={<div>Quản lý cảnh báo</div>} />
          <Route path="/admin/settings" element={<div>Cài đặt hệ thống</div>} />

          {/* Trang Cố vấn học tập */}
          <Route path="/advisor" element={<AdvisorPage />} />
          <Route path="/advisor/students" element={<div>Danh sách sinh viên</div>} />
          <Route path="/advisor/warning-students" element={<div>Sinh viên cảnh báo</div>} />
          <Route path="/advisor/schedule" element={<div>Lịch gặp sinh viên</div>} />
          <Route path="/advisor/statistics" element={<div>Thống kê kết quả</div>} />
          <Route path="/advisor/reports" element={<div>Báo cáo định kỳ</div>} />

          {/* Trang Sinh viên */}
          <Route path="/student" element={<StudentPage />} />
          <Route path="/student/profile" element={<div>Thông tin cá nhân</div>} />
          <Route path="/student/grades" element={<div>Bảng điểm</div>} />
          <Route path="/student/schedule" element={<div>Thời khóa biểu</div>} />
          <Route path="/student/tuition" element={<div>Học phí</div>} />
          <Route path="/student/registration" element={<div>Đăng ký học phần</div>} />
        </Routes>
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
