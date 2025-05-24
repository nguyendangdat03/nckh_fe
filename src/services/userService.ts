import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  role: string;
  student_code?: string;
  advisor_code?: string;
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
  }
};

export default userService; 