import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Student {
  user_id: number;
  username: string;
  email: string;
  student_code: string;
  class_name: string;
  class_id: number | null;
  phone_number: string;
  role: string;
  created_at: string;
}

const studentService = {
  /**
   * Lấy thông tin sinh viên theo mã sinh viên
   */
  getStudentByStudentCode: async (studentCode: string): Promise<Student | null> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/students`, {
        params: { student_code: studentCode },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      
      return null;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin sinh viên:", error);
      throw error;
    }
  }
};

export default studentService; 