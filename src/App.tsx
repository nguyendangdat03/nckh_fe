import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/homepage";
import ChatPage from "./pages/chat";
import AcademicWarning from "./pages/AcademicWarning";
import { BubbleChat } from "flowise-embed-react";
import "./App.css";
import { ThemeProvider, createTheme } from '@mui/material';
import LoginPage from './pages/loginpage';
import AdminDashboard from './pages/admin/Dashboard';
import AdvisorDashboard from './pages/advisor/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  // Thêm cấu hình theme ở đây
});

const PrivateRoute = ({ children, role }: { children: React.ReactNode; role: string }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== role) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route
              path="/admin/*"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/advisor/*"
              element={
                <PrivateRoute role="advisor">
                  <AdvisorDashboard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/student/*"
              element={
                <PrivateRoute role="student">
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>

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
    </ThemeProvider>
  );
}

export default App;
