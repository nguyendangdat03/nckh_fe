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
  original_name?: string;
  size: string | number;
  lastModified?: Date;
  uploadDate?: string;
  url?: string;
  semester?: number;
  year?: number;
  description?: string;
}

export interface ExcelData {
  fileName: string;
  originalName?: string;
  data: any[];
  sheets: string[];
  currentSheet: string;
  totalRows: number;
  semester?: number;
  year?: number;
  description?: string;
}

// Interface cho sinh viên bị cảnh báo học tập
export interface WarningStudent {
  student_code: string;
  student_name: string;
  class_name: string;
  gpa: number;
  reason: string;
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
        original_name: file.original_name,
        size: file.size,
        lastModified: file.lastModified,
        url: `/excel/${file.name}`,
        semester: file.semester,
        year: file.year,
        description: file.description
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
        originalName: data.originalName,
        data: Array.isArray(data.data) ? data.data : [],
        sheets: data.sheets || ['Sheet1'],
        currentSheet: data.currentSheet || data.sheets?.[0] || 'Sheet1',
        totalRows: data.totalRows || (Array.isArray(data.data) ? data.data.length : 0),
        semester: data.semester,
        year: data.year,
        description: data.description
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
  getSheetData: async (fileName: string, sheetName: string): Promise<any> => {
    try {
      // Sử dụng query parameter sheetName theo API
      const url = `${API_URL}/excel/${fileName}/sheet?sheetName=${encodeURIComponent(
        sheetName
      )}`;
      console.log(`Requesting sheet data from: ${url}`);

      const response = await axios.get(url);
      console.log("Response data structure:", JSON.stringify(response.data).substring(0, 100) + "...");

      // Xử lý dữ liệu sheet trả về với nhiều cấu trúc có thể có
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Kiểm tra xem có thuộc tính khác chứa dữ liệu không
        for (const key of Object.keys(response.data)) {
          if (Array.isArray(response.data[key])) {
            return { data: response.data[key] };
          }
        }
        // Nếu không tìm thấy mảng dữ liệu, trả về đối tượng gốc
        return response.data;
      } else {
        console.warn("Response format is unexpected:", response.data);
        return { data: [] };
      }
    } catch (error) {
      console.error(
        `Error fetching sheet "${sheetName}" from file "${fileName}":`,
        error
      );
      // Trả về mảng rỗng thay vì throw error để tránh màn hình trắng
      return { data: [] };
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
   * Gửi email cảnh báo học tập cho sinh viên và cố vấn học tập
   * @param fileName Tên file Excel
   * @param sheetName Tên sheet (lớp)
   * @param semester Học kỳ
   * @param year Năm học
   * @param studentTemplate Tên template email cho sinh viên (mặc định: "academic_warning")
   * @param advisorTemplate Tên template email cho cố vấn (mặc định: "advisor_warning")
   */
  sendAcademicWarning: async (
    fileName: string, 
    sheetName: string, 
    semester: number, 
    year: number,
    studentTemplate: string = "academic_warning", 
    advisorTemplate: string = "advisor_warning"
  ): Promise<any> => {
    try {
      // Lấy dữ liệu sheet
      const sheetData = await excelService.getSheetData(fileName, sheetName);
      console.log("Dữ liệu sheet để kiểm tra cảnh báo:", sheetData);

      // Xử lý dữ liệu từ API
      let processedData: any[] = [];
      if (Array.isArray(sheetData)) {
        processedData = sheetData;
      } else if (sheetData && typeof sheetData === 'object') {
        if (sheetData.data && Array.isArray(sheetData.data)) {
          processedData = sheetData.data;
        } else if (sheetData.data && sheetData.data.data && Array.isArray(sheetData.data.data)) {
          processedData = sheetData.data.data;
        }
      }

      if (processedData.length === 0) {
        console.log("Không có dữ liệu trong sheet để kiểm tra cảnh báo");
        return { success: false, message: "Không có dữ liệu" };
      }

      // Kiểm tra xem hàng đầu tiên có phải là metadata không
      const isFirstRowMetadata = processedData.length > 0 && (!processedData[0]["STT"]);
      const dataRows = isFirstRowMetadata ? processedData.slice(1) : processedData;

      // Lọc sinh viên bị cảnh báo học tập
      const warningStudents: WarningStudent[] = [];
      
      for (const row of dataRows) {
        // Tìm cột cảnh báo học tập
        let warningColumn = "";
        const possibleWarningColumns = [
          "MỨC CẢNH BÁO HỌC TẬP", 
          "Cảnh báo học tập", 
          "CanhBao", 
          "MỨC CẢNH BÁO HỌC TẬP ĐÃ NHẬN KỲ TRƯỚC", 
          "Mức cảnh báo",
          "Canh bao",
          "CẢNH BÁO"
        ];
        
        for (const col of possibleWarningColumns) {
          if (row[col] !== undefined) {
            warningColumn = col;
            break;
          }
        }
        
        // Nếu không tìm thấy cột đặc biệt, tìm theo tên chứa "cảnh báo"
        if (!warningColumn) {
          for (const key of Object.keys(row)) {
            if (key.toLowerCase().includes("cảnh báo") || key.toLowerCase().includes("canh bao")) {
              warningColumn = key;
              break;
            }
          }
        }

        // Kiểm tra giá trị cảnh báo học tập
        if (warningColumn && row[warningColumn]) {
          const warningValue = String(row[warningColumn]).toLowerCase();
          if (warningValue.includes("cảnh báo") || warningValue.includes("canh bao")) {
            // Tìm các cột dữ liệu quan trọng
            let idColumn = "";
            const possibleIdColumns = ["Mã SV", "MaSV", "MSSV", "Ma SV"];
            for (const col of possibleIdColumns) {
              if (row[col] !== undefined) {
                idColumn = col;
                break;
              }
            }
            
            let nameColumn = "";
            const possibleNameColumns = ["Họ và tên", "HoTen", "Ho va ten", "Họ tên", "HọTên"];
            for (const col of possibleNameColumns) {
              if (row[col] !== undefined) {
                nameColumn = col;
                break;
              }
            }
            
            let gpaColumn = "";
            const possibleGpaColumns = ["Điểm TB tích lũy", "DiemTBTichLuy", "Diem TB tich luy", "ĐiểmTBTíchLũy"];
            for (const col of possibleGpaColumns) {
              if (row[col] !== undefined) {
                gpaColumn = col;
                break;
              }
            }
            
            // Xác định lý do cảnh báo
            let reason = "Không đạt điểm yêu cầu";
            
            if (gpaColumn && parseFloat(row[gpaColumn]) < 2.0) {
              reason = "Điểm trung bình dưới 2.0";
            }
            
            // Thêm sinh viên vào danh sách cảnh báo
            if (idColumn && nameColumn) {
              warningStudents.push({
                student_code: row[idColumn],
                student_name: row[nameColumn],
                class_name: sheetName,
                gpa: gpaColumn ? parseFloat(row[gpaColumn]) : 0,
                reason: reason
              });
            }
          }
        }
      }
      
      if (warningStudents.length === 0) {
        console.log("Không có sinh viên bị cảnh báo học tập");
        return { success: true, message: "Không có sinh viên bị cảnh báo học tập" };
      }
      
      console.log(`Tìm thấy ${warningStudents.length} sinh viên bị cảnh báo học tập:`, warningStudents);
      
      // Gửi dữ liệu lên API để gửi email
      const payload = {
        students: warningStudents,
        semester: semester,
        year: year,
        excelFileName: fileName,
        studentTemplate: studentTemplate,
        advisorTemplate: advisorTemplate
      };
      
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}/mail/academic-warning`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        success: true,
        message: `Đã gửi email cảnh báo học tập cho ${warningStudents.length} sinh viên`,
        data: response.data
      };
      
    } catch (error) {
      console.error('Error sending academic warning emails:', error);
      return {
        success: false,
        message: 'Không thể gửi email cảnh báo học tập',
        error
      };
    }
  },
  
  /**
   * Upload file Excel mới với thông tin về kỳ học và gửi cảnh báo học tập nếu cần
   * @param formData FormData chứa file và các thông tin kỳ học (semester, year, description)
   * @param sendWarnings Có gửi cảnh báo học tập hay không
   * @param studentTemplate Tên template email cho sinh viên (mặc định: "academic_warning")
   * @param advisorTemplate Tên template email cho cố vấn (mặc định: "advisor_warning")
   */
  uploadExcelFileWithParamsAndWarning: async (
    formData: FormData, 
    sendWarnings: boolean = true,
    studentTemplate: string = "academic_warning",
    advisorTemplate: string = "advisor_warning"
  ): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/excel/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Nếu cần gửi cảnh báo học tập và upload thành công
      if (sendWarnings && response.data && response.data.fileName) {
        const fileName = response.data.fileName;
        const semester = parseInt(formData.get('semester') as string) || 1;
        const year = parseInt(formData.get('year') as string) || new Date().getFullYear();
        
        // Lấy thông tin về các sheet trong file
        const excelInfo = await excelService.getExcelInfo(fileName);
        
        // Gửi cảnh báo cho từng sheet (lớp)
        const warningResults = [];
        for (const sheet of excelInfo.sheets) {
          const warningResult = await excelService.sendAcademicWarning(
            fileName,
            sheet,
            semester,
            year,
            studentTemplate,
            advisorTemplate
          );
          warningResults.push({ sheet, result: warningResult });
        }
        
        return {
          ...response.data,
          warningResults
        };
      }
      
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
  },

  /**
   * Upload file Excel mới với thông tin về kỳ học
   * @param formData FormData chứa file và các thông tin kỳ học (semester, year, description)
   */
  uploadExcelFileWithParams: async (formData: FormData): Promise<any> => {
    try {
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
};

export default excelService;
