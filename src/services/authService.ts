import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface LoginCredentials {
  student_code: string;
  password: string;
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  student_code: string;
  class_name: string;
  phone_number: string;
  role: 'admin' | 'student' | 'advisor';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('Đang gửi yêu cầu đăng nhập với:', credentials.student_code);
    
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    console.log('Phản hồi từ API đăng nhập:', response.data);
    
    const { access_token, user } = response.data;
    
    if (!access_token || !user) {
      console.error('Thiếu token hoặc thông tin người dùng trong phản hồi:', response.data);
      throw new Error('Phản hồi từ máy chủ không hợp lệ');
    }
    
    // Lưu token vào localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('Đăng nhập thành công, đã lưu token và thông tin người dùng');
    return response.data;
  } catch (error: any) {
    console.error('Lỗi đăng nhập:', error);
    console.error('Chi tiết lỗi:', error.response?.data);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      console.log('Đang gửi yêu cầu đăng xuất');
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Đăng xuất thành công từ API');
    }
    
    // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    console.log('Đã xóa token và thông tin người dùng khỏi localStorage');
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    // Ngay cả khi API gặp lỗi, vẫn xóa dữ liệu local để đảm bảo đăng xuất
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Lỗi khi parse thông tin người dùng từ localStorage:', error);
      // Nếu có lỗi khi parse, xóa dữ liệu không hợp lệ
      localStorage.removeItem('user');
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('access_token') !== null;
};

// Cấu hình Axios để tự động gắn token vào header mọi request
export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Thêm interceptor để xử lý lỗi 401 (Unauthorized)
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        console.log('Phiên đăng nhập hết hạn hoặc không hợp lệ');
        // Xóa thông tin đăng nhập và chuyển hướng về trang login
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}; 