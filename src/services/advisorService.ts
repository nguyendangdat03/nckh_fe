import axios from "axios";
import { User } from "./userService";
import { Class } from "./classService";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Advisor {
  advisor_id: number;
  user_id: number;
  full_name: string;
  department: string;
  contact_email: string;
  phone_number?: string;
  office_location?: string;
  advisor_code?: string;
  user?: User;
  classes?: Class[];
}

export interface CreateAdvisorDto {
  user_id: number;
  full_name: string;
  department: string;
  contact_email: string;
  phone_number?: string;
  office_location?: string;
  advisor_code?: string;
}

export const advisorService = {
  /**
   * Lấy danh sách tất cả cố vấn
   */
  getAllAdvisors: async (): Promise<User[]> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/advisors`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching advisors:", error);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin cố vấn theo ID
   */
  getAdvisorById: async (id: number): Promise<Advisor> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/advisors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching advisor with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo cố vấn mới
   */
  createAdvisor: async (advisorData: CreateAdvisorDto): Promise<Advisor> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.post(`${API_URL}/advisors`, advisorData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error creating advisor:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin cố vấn
   */
  updateAdvisor: async (id: number, advisorData: Partial<CreateAdvisorDto>): Promise<Advisor> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.put(`${API_URL}/advisors/${id}`, advisorData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating advisor with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa cố vấn
   */
  deleteAdvisor: async (id: number): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      await axios.delete(`${API_URL}/advisors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(`Error deleting advisor with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách lớp học của cố vấn
   */
  getClassesByAdvisorId: async (advisorId: number): Promise<Class[]> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/advisors/${advisorId}/classes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching classes for advisor ID ${advisorId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách sinh viên của cố vấn
   */
  getStudentsByAdvisorId: async (advisorId: number): Promise<User[]> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/advisors/${advisorId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching students for advisor ID ${advisorId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin cố vấn hiện tại (đang đăng nhập)
   */
  getCurrentAdvisorProfile: async (): Promise<Advisor> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/advisors/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching current advisor profile:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin cố vấn hiện tại (đang đăng nhập)
   */
  updateCurrentAdvisorProfile: async (advisorData: Partial<CreateAdvisorDto>): Promise<Advisor> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.put(`${API_URL}/advisors/profile`, advisorData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error updating current advisor profile:", error);
      throw error;
    }
  }
};

export default advisorService; 