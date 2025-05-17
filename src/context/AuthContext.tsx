import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  user_id: number;
  username: string;
  email: string;
  student_code: string;
  class_name: string;
  phone_number: string;
  role: 'admin' | 'advisor' | 'student';
}

interface LoginResponse {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (student_code: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = async (student_code: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>('http://localhost:3000/auth/login', {
        student_code,
        password
      });

      const { access_token, user } = response.data;

      // Kiểm tra role hợp lệ
      if (!['admin', 'advisor', 'student'].includes(user.role)) {
        throw new Error('Không có quyền truy cập');
      }

      setUser(user);
      setToken(access_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', access_token);

      // Cấu hình axios để tự động thêm token vào header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 