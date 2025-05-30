import axios from "axios";
import { User } from "./userService";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Class {
  class_id: number;
  class_name: string;
  major: string;
  year_start: number;
  year_end: number;
  advisor_id: number;
  advisor?: User;
  students?: User[];
}

export interface CreateClassDto {
  class_name: string;
  major: string;
  year_start: number;
  year_end: number;
  advisor_id: number;
}

export interface AddStudentDto {
  userId: number;
  advisorId: number;
}

export const classService = {
  /**
   * Lấy danh sách tất cả lớp học
   */
  getAllClasses: async (): Promise<Class[]> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/classes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching classes:", error);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin lớp học theo ID
   */
  getClassById: async (id: number): Promise<Class> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/classes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching class with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo lớp học mới
   */
  createClass: async (classData: CreateClassDto): Promise<Class> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.post(`${API_URL}/classes`, classData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error creating class:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin lớp học
   */
  updateClass: async (id: number, classData: Partial<CreateClassDto>): Promise<Class> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.put(`${API_URL}/classes/${id}`, classData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating class with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa lớp học
   */
  deleteClass: async (id: number): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      await axios.delete(`${API_URL}/classes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(`Error deleting class with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách sinh viên của lớp
   */
  getStudentsByClassId: async (classId: number): Promise<User[]> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/classes/${classId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching students for class ID ${classId}:`, error);
      throw error;
    }
  },

  /**
   * Thêm sinh viên vào lớp
   */
  addStudentToClass: async (classId: number, addStudentDto: AddStudentDto): Promise<User> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.post(`${API_URL}/classes/${classId}/students`, addStudentDto, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error adding student to class ID ${classId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa sinh viên khỏi lớp
   */
  removeStudentFromClass: async (classId: number, userId: number): Promise<User> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.delete(`${API_URL}/classes/${classId}/students/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error removing student with ID ${userId} from class ID ${classId}:`, error);
      throw error;
    }
  }
};

export default classService; 