import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  user_id: number;
  username: string;
  email: string;
  fullname?: string;
  role: string;
  student_code?: string;
  advisor_code?: string;
  class_id?: number | null;
  class_name?: string;
  advisor_id?: number | null;
}

export interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  fullname: string;
  role: string;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  email?: string;
  fullname?: string;
  role?: string;
}

export const userService = {
  /**
   * Lấy danh sách tất cả người dùng
   */
  getAllUsers: async (): Promise<User[]> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin người dùng theo ID
   */
  getUserById: async (id: number): Promise<User> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo người dùng mới
   */
  createUser: async (userData: CreateUserDto): Promise<User> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.post(`${API_URL}/users`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin người dùng
   */
  updateUser: async (id: number, userData: UpdateUserDto): Promise<User> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.put(`${API_URL}/users/${id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa người dùng
   */
  deleteUser: async (id: number): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }
};

export default userService; 