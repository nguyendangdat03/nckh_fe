import axios from "axios";

const API_URL = "http://localhost:3000";

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
  size: string;
  uploadDate: string;
  url: string;
}

export interface ExcelData {
  fileName: string;
  data: any[];
  sheets: string[];
  totalRows: number;
}

export const excelService = {
  /**
   * Lấy danh sách tất cả các file Excel
   */
  getAllExcelFiles: async (): Promise<ExcelFile[]> => {
    try {
      const response = await axios.get(`${API_URL}/excel/files`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Excel files:", error);
      throw error;
    }
  },

  /**
   * Lấy dữ liệu từ file Excel
   * @param fileName Tên file Excel cần lấy dữ liệu
   */
  getExcelData: async (fileName: string): Promise<ExcelData> => {
    try {
      const response = await axios.get(`${API_URL}/excel/${fileName}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Excel data for file ${fileName}:`, error);
      throw error;
    }
  },

  /**
   * Lấy dữ liệu từ một sheet cụ thể trong file Excel
   * @param fileName Tên file Excel
   * @param sheetName Tên sheet cần lấy dữ liệu
   */
  getSheetData: async (fileName: string, sheetName: string): Promise<any[]> => {
    try {
      // Sử dụng query parameter sheetName thay vì đưa vào path
      const url = `${API_URL}/excel/${fileName}/sheet?sheetName=${encodeURIComponent(
        sheetName
      )}`;
      console.log(`Requesting sheet data from: ${url}`);

      const response = await axios.get(url);

      // Xử lý dữ liệu sheet trả về
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data;
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
};

export default excelService;
