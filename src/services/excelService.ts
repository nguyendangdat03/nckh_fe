import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Tạo một instance Axios với cấu hình không encode URL
const axiosInstance = axios.create({
  baseURL: API_URL,
  paramsSerializer: {
    encode: (param: string) => param, // Không encode params
  },
});

// Thêm interceptor để ghi đè lên hành vi mặc định của Axios
axiosInstance.interceptors.request.use((config) => {
  // Đảm bảo rằng URL không bị encode
  if (config.url) {
    // Giữ nguyên URL như chuỗi gốc
    config.url = config.url.replace(/%/g, "$$$$"); // Trick để giữ nguyên URL
  }
  return config;
});

export interface ExcelFile {
  name: string;
  size: string | number;
  lastModified?: Date;
  uploadDate?: string;
  url?: string;
}

export interface ExcelData {
  fileName: string;
  data: any[];
  sheets: string[];
  currentSheet: string;
  totalRows: number;
}

export const excelService = {
  /**
   * Lấy danh sách tất cả các file Excel
   */
  getAllExcelFiles: async (): Promise<ExcelFile[]> => {
    try {
      const response = await axios.get(`${API_URL}/excel`);
      return response.data.map((file: any) => ({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        url: `/excel/${file.name}`
      }));
    } catch (error) {
      console.error("Error fetching Excel files:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin về file Excel bao gồm danh sách sheets (tên lớp)
   * @param fileName Tên file Excel
   */
  getExcelInfo: async (fileName: string): Promise<{sheets: string[]}> => {
    try {
      // Lấy thông tin file Excel từ API
      const response = await axios.get(`${API_URL}/excel/${fileName}`);
      
      // Trích xuất danh sách sheets từ response
      const sheets = response.data.sheets || ['Sheet1'];
      
      return { sheets };
    } catch (error) {
      console.error(`Error fetching Excel info for file ${fileName}:`, error);
      return { sheets: ['Sheet1'] };
    }
  },

  /**
   * Lấy dữ liệu từ file Excel
   * @param fileName Tên file Excel cần lấy dữ liệu
   */
  getExcelData: async (fileName: string): Promise<ExcelData> => {
    try {
      const response = await axios.get(`${API_URL}/excel/${fileName}`);
      
      // Xử lý dữ liệu trả về từ API
      const data = response.data;
      
      return {
        fileName: data.fileName || fileName,
        data: Array.isArray(data.data) ? data.data : [],
        sheets: data.sheets || ['Sheet1'],
        currentSheet: data.currentSheet || data.sheets?.[0] || 'Sheet1',
        totalRows: data.totalRows || (Array.isArray(data.data) ? data.data.length : 0)
      };
    } catch (error) {
      console.error(`Error fetching Excel data for file ${fileName}:`, error);
      throw error;
    }
  },

  /**
   * Lấy dữ liệu từ một sheet (lớp) cụ thể trong file Excel
   * @param fileName Tên file Excel
   * @param sheetName Tên sheet (lớp) cần lấy dữ liệu
   */
  getSheetData: async (fileName: string, sheetName: string): Promise<any[]> => {
    try {
      // Sử dụng query parameter sheetName theo API
      const url = `${API_URL}/excel/${fileName}/sheet?sheetName=${encodeURIComponent(
        sheetName
      )}`;
      console.log(`Requesting sheet data from: ${url}`);

      const response = await axios.get(url);

      // Xử lý dữ liệu sheet trả về
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn("Response format is unexpected:", response.data);
        return [];
      }
    } catch (error) {
      console.error(
        `Error fetching sheet "${sheetName}" from file "${fileName}":`,
        error
      );
      throw error;
    }
  },

  /**
   * Upload file Excel mới
   * @param file File Excel cần upload
   */
  uploadExcelFile: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/excel/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      throw error;
    }
  },

  /**
   * Cập nhật dữ liệu file Excel
   * @param fileName Tên file Excel cần cập nhật
   * @param newData Dữ liệu mới
   */
  updateExcelFile: async (fileName: string, newData: any[]): Promise<any> => {
    try {
      const response = await axios.put(`${API_URL}/excel/${fileName}`, newData);
      return response.data;
    } catch (error) {
      console.error(`Error updating Excel file ${fileName}:`, error);
      throw error;
    }
  },

  /**
   * Xóa file Excel
   * @param fileName Tên file Excel cần xóa
   */
  deleteExcelFile: async (fileName: string): Promise<any> => {
    try {
      const response = await axios.delete(`${API_URL}/excel/${fileName}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting Excel file ${fileName}:`, error);
      throw error;
    }
  }
};

export default excelService;
