import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, login as apiLogin, logout as apiLogout, getCurrentUser, LoginCredentials } from './authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa khi ứng dụng khởi động
    const checkAuth = () => {
      try {
        const currentUser = getCurrentUser();
        console.log('Thông tin người dùng hiện tại:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Đang xử lý đăng nhập trong AuthContext');
      const response = await apiLogin(credentials);
      console.log('Đăng nhập thành công trong AuthContext:', response);
      
      if (!response || !response.user) {
        throw new Error('Không nhận được thông tin người dùng từ API');
      }
      
      setUser(response.user);

      // Chuyển hướng dựa theo vai trò
      if (response.user.role === 'admin') {
        console.log('Chuyển hướng đến trang admin');
        navigate('/admin');
      } else if (response.user.role === 'advisor') {
        console.log('Chuyển hướng đến trang advisor');
        navigate('/advisor');
      } else if (response.user.role === 'student') {
        console.log('Chuyển hướng đến trang student');
        navigate('/student');
      } else {
        console.warn('Vai trò không xác định:', response.user.role);
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Lỗi đăng nhập trong AuthContext:', error);
      let errorMessage = 'Đăng nhập không thành công';
      
      if (error.response) {
        console.error('Chi tiết lỗi từ API:', error.response.data);
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Đang xử lý đăng xuất trong AuthContext');
      await apiLogout();
      setUser(null);
      console.log('Chuyển hướng đến trang đăng nhập sau khi đăng xuất');
      navigate('/login');
    } catch (error: any) {
      console.error('Lỗi đăng xuất trong AuthContext:', error);
      let errorMessage = 'Đăng xuất không thành công';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 