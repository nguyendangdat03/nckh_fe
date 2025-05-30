import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import AdvisorLayout from "../layouts/AdvisorLayout";
import StudentLayout from "../layouts/StudentLayout";
import excelService from "../services/excelService";
import {
  FaFileExcel,
  FaSpinner,
  FaSearch,
  FaExclamationTriangle,
  FaGraduationCap,
  FaFilter,
  FaDownload,
  FaEye,
  FaEnvelope,
} from "react-icons/fa";
import SupportEmailTemplate from "../components/SupportEmailTemplate";

const AcademicWarning: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [excelFiles, setExcelFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [filterWarningOnly, setFilterWarningOnly] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [viewingDetail, setViewingDetail] = useState<any | null>(null);
  const [semesterInfo, setSemesterInfo] = useState<{semester?: number, year?: number, description?: string}>({});
  const [compareFile, setCompareFile] = useState<string | null>(null);
  const [compareSheetData, setCompareSheetData] = useState<any[]>([]);
  const [compareSemesterInfo, setCompareSemesterInfo] = useState<{semester?: number, year?: number, description?: string}>({});
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserInfo(user);
      } catch (error) {
        console.error('Lỗi khi parse thông tin người dùng:', error);
      }
    }
  }, []);

  // Lấy danh sách file Excel
  useEffect(() => {
    const fetchExcelFiles = async () => {
      try {
        setLoading(true);
        const files = await excelService.getAllExcelFiles();
        setExcelFiles(files);
        setError(null);
      } catch (err) {
        console.error("Error fetching excel files:", err);
        setError("Không thể tải danh sách file Excel. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchExcelFiles();
  }, []);

  // Xử lý chọn file
  const handleFileSelect = async (fileName: string) => {
    try {
      setLoading(true);
      setSelectedFile(fileName);
      setSelectedSheet(null);
      setSheetData([]);
      
      // Lấy thông tin về các sheets (lớp) trong file
      const excelData = await excelService.getExcelData(fileName);
      setAvailableSheets(excelData.sheets);
      
      // Lấy thông tin học kỳ và năm học nếu có
      setSemesterInfo({
        semester: excelData.semester,
        year: excelData.year,
        description: excelData.description
      });
      
      // Nếu có ít nhất một sheet, chọn sheet đầu tiên
      if (excelData.sheets.length > 0) {
        setSelectedSheet(excelData.currentSheet || excelData.sheets[0]);
        await loadSheetData(fileName, excelData.currentSheet || excelData.sheets[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error selecting file:", err);
      setError(`Không thể tải thông tin file ${fileName}. Vui lòng thử lại sau.`);
      setAvailableSheets([]);
      setSemesterInfo({});
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn sheet (lớp)
  const handleSheetSelect = async (sheetName: string) => {
    if (!selectedFile) return;
    
    setSelectedSheet(sheetName);
    await loadSheetData(selectedFile, sheetName);
  };

  // Tải dữ liệu từ sheet (lớp)
  const loadSheetData = async (fileName: string, sheetName: string) => {
    try {
      setLoading(true);
      
      // Gọi API để lấy dữ liệu sheet
      console.log(`Đang tải dữ liệu từ file ${fileName}, sheet ${sheetName}`);
      const response: any = await excelService.getSheetData(fileName, sheetName);
      
      // Kiểm tra dữ liệu
      console.log("Dữ liệu API trả về:", response);
      
      // Đảm bảo dữ liệu là mảng
      let processedData: any[] = [];
      
      if (Array.isArray(response)) {
        processedData = response;
      } else if (response && typeof response === 'object') {
        // Kiểm tra nếu response có thuộc tính data là mảng
        if (response.data && Array.isArray(response.data)) {
          processedData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Nếu response.data.data tồn tại và là mảng
          processedData = response.data.data;
        }
      }
      
      console.log("Dữ liệu sau khi xử lý:", processedData.length);
      
      // Thêm STT nếu cần
      if (processedData.length > 0) {
        processedData = processedData.map((row, index) => {
          if (!row.STT) {
            return { STT: index + 1, ...row };
          }
          return row;
        });
        console.log("Dữ liệu sau khi thêm STT:", processedData.length);
      } else {
        console.log("Không tìm thấy dữ liệu nào");
      }
      
      // Cập nhật state
      setSheetData(processedData);
      
      if (processedData.length === 0) {
        setError(`Không có dữ liệu trong lớp ${sheetName}`);
      } else {
        setError(null);
      }
    } catch (err) {
      console.error(`Error loading sheet data for ${sheetName}:`, err);
      setError(`Không thể tải dữ liệu lớp ${sheetName}. Vui lòng thử lại sau.`);
      setSheetData([]);
    } finally {
      setLoading(false);
    }
  };

  // Lọc và tìm kiếm dữ liệu
  const getFilteredData = () => {
    console.log("Dữ liệu hiện tại:", sheetData);
    
    if (!sheetData || sheetData.length === 0) {
      console.log("Không có dữ liệu trong sheet");
      return [];
    }
    
    // Kiểm tra xem dữ liệu đầu tiên có phải dòng chứa thông tin tín chỉ
    // Nếu dòng đầu tiên không có STT, đó có thể là dòng chứa thông tin tín chỉ
    const isFirstRowCreditInfo = sheetData.length > 0 && !sheetData[0]["STT"];
    
    // Bỏ qua hàng đầu tiên nếu nó chứa thông tin môn học và số tín chỉ
    const dataToSearch = isFirstRowCreditInfo ? sheetData.slice(1) : sheetData;
    
    console.log("Dữ liệu để tìm kiếm:", dataToSearch.length, "dòng");
    
    // Nếu là sinh viên, chỉ hiển thị dữ liệu của sinh viên đó
    if (userInfo?.role === 'student') {
      return getStudentData() ? [getStudentData()] : [];
    }
    
    // Lấy các cột quan trọng
    const idColumn = getColumnByType("id");
    const nameColumn = getColumnByType("name");
    const warningColumn = getColumnByType("warning");
    
    console.log("Các cột tìm kiếm:", { idColumn, nameColumn, warningColumn });
    console.log("Vai trò người dùng:", userInfo?.role);
    
    // Kiểm tra từng dòng dữ liệu
    for (let i = 0; i < Math.min(dataToSearch.length, 5); i++) {
      console.log(`Dòng dữ liệu ${i}:`, dataToSearch[i]);
    }
    
    const filteredResult = dataToSearch.filter(row => {
      // Bỏ qua các hàng không có dữ liệu hoặc hàng tiêu đề
      if (!row[idColumn] || row[idColumn] === "Mã SV" || row[idColumn] === "MaSV") {
        return false;
      }
      
      // Lọc theo cảnh báo nếu được bật
      if (filterWarningOnly && warningColumn) {
        const warningStatus = row[warningColumn]?.toString() || "";
        if (!warningStatus.toLowerCase().includes("cảnh báo")) {
          return false;
        }
      }
      
      // Tìm kiếm theo từ khóa
      if (searchTerm) {
        const searchFields = [
          row[idColumn]?.toString() || "",
          row[nameColumn]?.toString() || "",
          row[warningColumn]?.toString() || "",
        ];
        
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return true;
    });
    
    console.log("Kết quả lọc:", filteredResult.length, "dòng");
    return filteredResult;
  };

  // Tìm kiếm dữ liệu của sinh viên hiện tại
  const getStudentData = () => {
    if (sheetData.length === 0 || !userInfo || userInfo.role !== 'student') return null;
    
    // Kiểm tra xem dữ liệu đầu tiên có phải dòng chứa thông tin tín chỉ
    const isFirstRowCreditInfo = sheetData.length > 0 && !sheetData[0]["STT"];
    
    // Bỏ qua hàng đầu tiên nếu nó chứa thông tin môn học và số tín chỉ
    const dataToSearch = isFirstRowCreditInfo ? sheetData.slice(1) : sheetData;
    
    // Tìm kiếm theo mã sinh viên trong các cột có thể chứa mã sinh viên
    const possibleIdColumns = ["Mã SV", "MaSV", "MSSV"];
    
    return dataToSearch.find(row => {
      // Kiểm tra từng cột có thể chứa mã sinh viên
      for (const col of possibleIdColumns) {
        if (row[col] && row[col].toString() === userInfo.student_code) {
          return true;
        }
      }
      return false;
    });
  };

  // Xác định các cột dữ liệu quan trọng
  const getColumnByType = (type: "id" | "name" | "warning" | "gpa" | "credits") => {
    if (!sheetData || sheetData.length === 0) {
      console.log(`getColumnByType: Không có dữ liệu để xác định cột ${type}`);
      return "";
    }
    
    // Bỏ qua hàng đầu tiên nếu nó chứa thông tin môn học và số tín chỉ
    const dataRow = sheetData.length > 0 && !sheetData[0]["STT"] ? sheetData[1] : sheetData[0];
    if (!dataRow) {
      console.log(`getColumnByType: Không tìm thấy hàng dữ liệu để xác định cột ${type}`);
      return "";
    }
    
    const columnMappings: {[key: string]: string[]} = {
      id: ["Mã SV", "MaSV", "MSSV", "Ma SV"],
      name: ["Họ và tên", "HoTen", "Ho va ten", "Họ tên", "HọTên"],
      warning: ["MỨC CẢNH BÁO HỌC TẬP", "Cảnh báo học tập", "CanhBao", "MỨC CẢNH BÁO HỌC TẬP ĐÃ NHẬN KỲ TRƯỚC", "Mức cảnh báo", "Canh bao", "Muc canh bao", "CẢNH BÁO"],
      gpa: ["Điểm TB tích lũy", "DiemTBTichLuy", "Diem TB tich luy", "ĐiểmTBTíchLũy"],
      credits: ["Tổng số tín chỉ tích lũy", "TongTC", "TC tích lũy", "Tổng số TC tích lũy"]
    };
    
    // Tìm cột phù hợp
    const allColumns = Object.keys(dataRow);
    const possibleColumns = columnMappings[type];
    
    console.log(`getColumnByType: Đang tìm kiếm cột ${type} trong các cột:`, allColumns);
    
    for (const col of possibleColumns) {
      if (allColumns.includes(col)) {
        console.log(`getColumnByType: Đã tìm thấy cột ${type} -> ${col}`);
        return col;
      }
    }
    
    // Nếu không tìm thấy cột chính xác, thử tìm theo cách khác với tên cột có thể chứa các từ khóa
    if (type === "warning") {
      for (const col of allColumns) {
        if (col.toLowerCase().includes("cảnh báo") || col.toLowerCase().includes("canh bao")) {
          console.log(`getColumnByType: Đã tìm thấy cột ${type} với từ khóa -> ${col}`);
          return col;
        }
      }
    }
    
    if (type === "name") {
      for (const col of allColumns) {
        if (col.toLowerCase().includes("họ tên") || col.toLowerCase().includes("ho ten")) {
          console.log(`getColumnByType: Đã tìm thấy cột ${type} với từ khóa -> ${col}`);
          return col;
        }
      }
    }
    
    console.log(`getColumnByType: Không tìm thấy cột ${type}, trả về mặc định ${possibleColumns[0]}`);
    return possibleColumns[0]; // Trả về cột mặc định nếu không tìm thấy
  };

  // Lấy danh sách các cột cần hiển thị
  const getDisplayColumns = () => {
    if (sheetData.length === 0) return [];

    // Bỏ qua hàng đầu tiên nếu nó chứa thông tin môn học và số tín chỉ
    const dataRow = sheetData.length > 0 && !sheetData[0]["STT"] ? sheetData[1] : sheetData[0];
    if (!dataRow) return [];

    // Các cột cơ bản cần hiển thị (luôn hiển thị)
    const baseColumns = [
      "STT",
      "Mã SV",
      "Họ và tên",
      "Ngày sinh",
      "Điểm TB học kỳ",
      "Tổng số tín chỉ tích lũy",
      "Điểm TB tích lũy",
      "MỨC CẢNH BÁO HỌC TẬP"
    ];

    // Lấy tất cả các cột từ dữ liệu
    const allColumns = Object.keys(dataRow);
    
    // Lấy các cột cơ bản có trong dữ liệu
    const visibleBaseColumns = baseColumns.filter(col => allColumns.includes(col));
    
    // Lấy các cột môn học (không có trong danh sách cột cơ bản và không phải cột tổng hợp)
    const excludeColumns = [
      ...baseColumns,
      "Tổng số TC trong học kỳ",
      "Điểm TB học kỳ",
      "Tổng số tín chỉ tích lũy",
      "Điểm TB tích lũy",
      "MỨC CẢNH BÁO HỌC TẬP"
    ];
    
    // Lấy các cột môn học (các cột còn lại không phải cột cơ bản)
    const subjectColumns = allColumns.filter(col => !excludeColumns.includes(col));
    
    // Sắp xếp: cột cơ bản trước, sau đó là các môn học, và cuối cùng là các cột tổng hợp khác
    return [
      ...visibleBaseColumns,
      ...subjectColumns,
      "Tổng số TC trong học kỳ",
      "Điểm TB học kỳ",
      "Tổng số tín chỉ tích lũy",
      "Điểm TB tích lũy",
      "MỨC CẢNH BÁO HỌC TẬP"
    ].filter(col => allColumns.includes(col));
  };

  const filteredData = getFilteredData();
  const displayColumns = getDisplayColumns();
  const studentData = getStudentData();

  // Đếm số sinh viên bị cảnh báo
  const countWarningStudents = () => {
    if (sheetData.length === 0) return 0;
    
    // Bỏ qua hàng đầu tiên nếu là hàng tiêu đề môn học
    const dataToCount = sheetData.length > 0 && !sheetData[0]["STT"] ? sheetData.slice(1) : sheetData;
    
    const warningColumn = getColumnByType("warning");
    return dataToCount.filter(row => {
      // Bỏ qua các hàng không có dữ liệu hoặc hàng tiêu đề
      if (!row || !row[getColumnByType("id")]) return false;
      
      const warningStatus = row[warningColumn]?.toString() || "";
      return warningStatus.toLowerCase().includes("cảnh báo") || warningStatus.toLowerCase().includes("canh bao");
    }).length;
  };

  // Kiểm tra quyền của người dùng
  const isAdmin = userInfo?.role === 'admin';
  const isAdvisor = userInfo?.role === 'advisor';
  const isStudent = userInfo?.role === 'student';

  // Kiểm tra xem sinh viên có đang bị cảnh báo học tập không
  const hasWarningStatus = (student: any) => {
    if (!student) return false;
    
    const warningColumn = getColumnByType("warning");
    if (!warningColumn || !student[warningColumn]) return false;
    
    const warningStatus = student[warningColumn].toString().toLowerCase();
    return warningStatus.includes("cảnh báo") || warningStatus.includes("canh bao");
  };
  
  // Xử lý gửi email cho sinh viên
  const handleSendSupportEmail = (student: any) => {
    setSelectedStudent(student);
    setShowEmailModal(true);
  };

  // Xử lý việc xem chi tiết sinh viên
  const handleViewDetail = (student: any) => {
    setViewingDetail(student);
  };

  // Đóng modal xem chi tiết
  const handleCloseDetail = () => {
    setViewingDetail(null);
  };

  // Định dạng thông tin học kỳ
  const getSemesterDisplay = () => {
    if (semesterInfo.semester && semesterInfo.year) {
      return `Học kỳ ${semesterInfo.semester}/${semesterInfo.year}`;
    }
    return "";
  };

  // Chọn file để so sánh
  const handleSelectCompareFile = async (fileName: string) => {
    try {
      setLoading(true);
      setCompareFile(fileName);
      
      // Lấy thông tin về các sheets (lớp) trong file
      const excelData = await excelService.getExcelData(fileName);
      
      // Lấy thông tin học kỳ và năm học nếu có
      setCompareSemesterInfo({
        semester: excelData.semester,
        year: excelData.year,
        description: excelData.description
      });
      
      // Nếu có ít nhất một sheet, chọn sheet đầu tiên
      if (excelData.sheets.length > 0 && selectedSheet) {
        const targetSheet = excelData.sheets.includes(selectedSheet) ? 
          selectedSheet : excelData.sheets[0];
          
        console.log(`Tải dữ liệu từ sheet ${targetSheet} của file ${fileName} để so sánh`);
        // Lấy dữ liệu của sheet để so sánh
        const response = await excelService.getSheetData(fileName, targetSheet);
        
        // Đảm bảo dữ liệu là mảng (xử lý giống như trong loadSheetData)
        let processedData: any[] = [];
        
        if (Array.isArray(response)) {
          processedData = response;
        } else if (response && typeof response === 'object') {
          // Kiểm tra nếu response có thuộc tính data là mảng
          if (response.data && Array.isArray(response.data)) {
            processedData = response.data;
          } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            // Nếu response.data.data tồn tại và là mảng
            processedData = response.data.data;
          }
        }
        
        console.log(`Dữ liệu so sánh sau khi xử lý: ${processedData.length} dòng`);
        
        // Thêm STT nếu cần
        if (processedData.length > 0) {
          processedData = processedData.map((row, index) => {
            if (!row.STT) {
              return { STT: index + 1, ...row };
            }
            return row;
          });
        }
        
        // Kiểm tra và đặt dữ liệu so sánh
        if (processedData.length > 0) {
          setCompareSheetData(processedData);
          setIsComparing(true);
          setError(null);
          console.log(`Đã tải ${processedData.length} dòng dữ liệu để so sánh`);
        } else {
          console.warn(`Không có dữ liệu trong sheet ${targetSheet} của file ${fileName}`);
          setCompareSheetData([]);
          setError(`Không có dữ liệu trong sheet ${targetSheet} của file ${fileName} để so sánh`);
        }
      } else {
        console.warn('Không có sheet nào trong file so sánh');
        setCompareSheetData([]);
      }
      
      setIsComparing(true);
    } catch (err) {
      console.error("Error selecting compare file:", err);
      setCompareFile(null);
      setCompareSheetData([]);
      setCompareSemesterInfo({});
      setIsComparing(false);
      setError(`Không thể tải dữ liệu từ file ${fileName} để so sánh`);
    } finally {
      setLoading(false);
    }
  };
  
  // Hủy so sánh
  const cancelCompare = () => {
    setCompareFile(null);
    setCompareSheetData([]);
    setCompareSemesterInfo({});
    setIsComparing(false);
  };

  // Tìm dữ liệu của sinh viên trong file so sánh
  const getCompareStudentData = (studentId: string) => {
    if (compareSheetData.length === 0) return null;
    
    console.log(`Đang tìm kiếm sinh viên với mã: "${studentId}" trong dữ liệu so sánh`);
    console.log(`Số dòng dữ liệu so sánh: ${compareSheetData.length}`);
    
    // Bỏ qua hàng đầu tiên nếu nó chứa thông tin môn học và số tín chỉ
    const dataToSearch = compareSheetData.length > 0 && !compareSheetData[0]["STT"] ? 
      compareSheetData.slice(1) : compareSheetData;
    
    console.log(`Số dòng dữ liệu sau khi lọc: ${dataToSearch.length}`);
    
    // Tìm kiếm theo mã sinh viên
    const idColumn = getColumnByType("id");
    console.log(`Tìm kiếm trong cột: ${idColumn}`);
    
    // Kiểm tra một vài dòng đầu tiên
    for (let i = 0; i < Math.min(5, dataToSearch.length); i++) {
      console.log(`Dòng ${i}:`, dataToSearch[i]);
      if (idColumn && dataToSearch[i][idColumn]) {
        console.log(`Mã SV từ dữ liệu: "${dataToSearch[i][idColumn]}"`);
      }
    }
    
    // Tìm kiếm theo nhiều cách để tăng khả năng tìm thấy
    const result = dataToSearch.find(row => {
      if (!row[idColumn]) return false;
      
      const rowId = row[idColumn].toString().trim();
      const searchId = studentId.toString().trim();
      
      // So sánh chính xác
      if (rowId === searchId) return true;
      
      // So sánh không phân biệt hoa thường
      if (rowId.toLowerCase() === searchId.toLowerCase()) return true;
      
      // Chuẩn hóa chuỗi Unicode (xóa dấu)
      const normalizedRowId = rowId.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normalizedSearchId = searchId.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalizedRowId === normalizedSearchId) return true;
      
      return false;
    });
    
    console.log(`Kết quả tìm kiếm:`, result ? `Tìm thấy sinh viên ${result[idColumn]}` : "Không tìm thấy");
    
    return result;
  };
  
  // So sánh dữ liệu sinh viên giữa 2 file
  const compareStudentData = (currentData: any, previousData: any) => {
    if (!currentData || !previousData) return null;
    
    // Tìm tên cột cho các chỉ số quan trọng
    const gpaColumn = getColumnByType("gpa");
    const creditsColumn = getColumnByType("credits");
    const warningColumn = getColumnByType("warning");
    
    const comparableFields = [
      "Điểm TB học kỳ", 
      gpaColumn, 
      creditsColumn,
      warningColumn
    ];
    
    const differences = comparableFields.reduce((acc: any, field: string) => {
      const current = currentData[field];
      const previous = previousData[field];
      
      // Kiểm tra có sự khác biệt không
      const isDifferent = current != previous; // Dùng != thay vì !== vì có thể có sự chênh lệch về kiểu dữ liệu
      
      if (isDifferent) {
        if (field === warningColumn) {
          // Xác định sự thay đổi về trạng thái cảnh báo
          const hasImproved = 
            (!current || current === "") && 
            (previous && (previous.toString().toLowerCase().includes("cảnh báo") || previous.toString().toLowerCase().includes("canh bao")));
          
          const hasWorsened = 
            (current && (current.toString().toLowerCase().includes("cảnh báo") || current.toString().toLowerCase().includes("canh bao"))) && 
            (!previous || previous === "");
          
          const statusLabel = hasImproved ? "Cải thiện" : 
                            hasWorsened ? "Xấu đi" : "Thay đổi";
          
          acc[field] = {
            previous: previous || "Bình thường",
            current: current || "Bình thường",
            difference: statusLabel,
            improved: hasImproved,
            worsened: hasWorsened
          };
        } else {
          // Xử lý các trường số
          const currentNum = parseFloat(current) || 0;
          const previousNum = parseFloat(previous) || 0;
          const diff = currentNum - previousNum;
          const improved = diff > 0;
          
          acc[field] = {
            previous: previousNum,
            current: currentNum,
            difference: diff.toFixed(2),
            improved: improved,
            worsened: !improved && diff !== 0
          };
        }
      }
      
      return acc;
    }, {});
    
    // So sánh các môn học
    const idColumn = getColumnByType("id");
    const nameColumn = getColumnByType("name");
    
    const subjects = Object.keys(currentData).filter(key => 
      ![
        "STT", 
        idColumn, 
        nameColumn, 
        "Ngày sinh", 
        "Tổng số TC trong học kỳ", 
        "Điểm TB học kỳ", 
        creditsColumn, 
        gpaColumn, 
        warningColumn
      ].includes(key) &&
      currentData[key] !== undefined && currentData[key] !== ""
    );
    
    const subjectChanges = subjects.reduce((acc: any, subject: string) => {
      const currentGrade = parseFloat(currentData[subject]) || 0;
      const previousGrade = parseFloat(previousData[subject]) || 0;
      
      if (previousGrade > 0 && currentGrade !== previousGrade) {
        const diff = currentGrade - previousGrade;
        acc[subject] = {
          previous: previousGrade,
          current: currentGrade,
          difference: diff.toFixed(2),
          improved: diff > 0,
          worsened: diff < 0
        };
      }
      
      return acc;
    }, {});
    
    return {
      summary: differences,
      subjects: subjectChanges,
      hasChanges: Object.keys(differences).length > 0 || Object.keys(subjectChanges).length > 0
    };
  };

  // Chọn layout phù hợp dựa trên vai trò người dùng
  const renderContent = () => {
    return (
      <div className="w-full h-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-indigo-900 flex items-center">
            <FaExclamationTriangle className="mr-2 text-yellow-500" />
            Điểm cảnh báo học tập
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Danh sách file Excel */}
          <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-md p-4 h-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Chọn File</h2>
              {isComparing && (
                <button 
                  onClick={cancelCompare}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center"
                >
                  Hủy so sánh
                </button>
              )}
            </div>
            
            {loading && !excelFiles.length ? (
              <div className="flex justify-center items-center h-32">
                <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[500px]">
                {excelFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`p-3 border-b cursor-pointer flex items-center justify-between ${
                      selectedFile === file.name
                        ? "bg-indigo-100"
                        : compareFile === file.name
                        ? "bg-yellow-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center" onClick={() => handleFileSelect(file.name)}>
                      <FaFileExcel className={`mr-2 ${compareFile === file.name ? "text-yellow-600" : "text-green-600"}`} />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {typeof file.size === 'number' 
                            ? `${(file.size / 1024).toFixed(2)} KB` 
                            : file.size}
                        </p>
                      </div>
                    </div>
                    {(isAdmin || isAdvisor) && selectedFile === file.name && selectedFile !== compareFile && (
                      <button
                        className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        title="So sánh với file khác"
                        onClick={(e) => {
                          e.stopPropagation();
                          const otherFiles = excelFiles.filter(f => f.name !== file.name);
                          if (otherFiles.length > 0) {
                            alert("Vui lòng chọn một file khác để so sánh với file hiện tại");
                          } else {
                            alert("Không có file khác để so sánh");
                          }
                        }}
                      >
                        So sánh
                      </button>
                    )}
                    {(isAdmin || isAdvisor) && selectedFile && selectedFile !== file.name && !compareFile && (
                      <button
                        className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        title="Chọn file này để so sánh với file hiện tại"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCompareFile(file.name);
                        }}
                      >
                        Chọn để so sánh
                      </button>
                    )}
                  </div>
                ))}
                {!excelFiles.length && (
                  <p className="text-gray-500 text-center">
                    Không có file Excel nào
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Nội dung sheet */}
          <div className="w-full lg:w-3/4 bg-white rounded-lg shadow-md p-4 h-auto">
            {selectedFile ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                  <div className="flex items-center">
                    <h2 className="text-lg font-semibold mr-4">
                      {selectedFile}
                    </h2>
                    
                    {/* Chọn lớp (sheet) */}
                    {availableSheets.length > 0 && (
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-600">Lớp:</span>
                        <div className="relative">
                          <select
                            value={selectedSheet || ""}
                            onChange={(e) => handleSheetSelect(e.target.value)}
                            className="pl-8 pr-4 py-1 border rounded-lg appearance-none bg-white"
                          >
                            {availableSheets.map((sheet) => (
                              <option key={sheet} value={sheet}>
                                {sheet}
                              </option>
                            ))}
                          </select>
                          <FaGraduationCap className="absolute left-2 top-2 text-gray-500" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Tùy chọn tìm kiếm và tải xuống - chỉ hiển thị cho admin và advisor */}
                  {(isAdmin || isAdvisor) && (
                    <div className="flex items-center space-x-2">
                      {/* Tìm kiếm */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Tìm kiếm sinh viên..."
                          className="pl-8 pr-4 py-1 border rounded-lg w-48"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="absolute left-2 top-2 text-gray-500" />
                      </div>
                      
                      {/* Lọc cảnh báo */}
                      <button
                        className={`flex items-center px-3 py-1 rounded-lg border ${
                          filterWarningOnly ? "bg-yellow-100 border-yellow-400" : "bg-white"
                        }`}
                        onClick={() => setFilterWarningOnly(!filterWarningOnly)}
                        title={filterWarningOnly ? "Hiển thị tất cả" : "Chỉ hiển thị sinh viên bị cảnh báo"}
                      >
                        <FaFilter className={`mr-1 ${filterWarningOnly ? "text-yellow-600" : "text-gray-500"}`} />
                        <span className="text-sm">Cảnh báo</span>
                      </button>
                      
                      {/* Tải xuống - chỉ cho admin */}
                      {isAdmin && (
                        <a
                          href={`http://localhost:3000/excel/${selectedFile}`}
                          download
                          className="flex items-center px-3 py-1 rounded-lg border bg-white hover:bg-gray-50"
                          title="Tải xuống file Excel"
                        >
                          <FaDownload className="mr-1 text-green-600" />
                          <span className="text-sm">Tải xuống</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Hiển thị thông tin kỳ học và năm học */}
                {(semesterInfo.semester || semesterInfo.year || semesterInfo.description) && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex flex-wrap gap-4">
                      {getSemesterDisplay() && (
                        <div className="flex items-center">
                          <span className="font-medium text-blue-800">Học kỳ:</span>
                          <span className="ml-2">{getSemesterDisplay()}</span>
                        </div>
                      )}
                      {semesterInfo.description && (
                        <div className="flex items-center">
                          <span className="font-medium text-blue-800">Lớp:</span>
                          <span className="ml-2">{semesterInfo.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Hiển thị thông tin file so sánh nếu đang so sánh */}
                {isComparing && compareFile && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-medium text-yellow-800">So sánh với file:</h3>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center">
                          <span className="font-medium">File được chọn:</span>
                          <span className="ml-2">{compareFile}</span>
                        </div>
                        {compareSemesterInfo.semester && compareSemesterInfo.year && (
                          <div className="flex items-center">
                            <span className="font-medium">Học kỳ:</span>
                            <span className="ml-2">{compareSemesterInfo.semester}/{compareSemesterInfo.year}</span>
                          </div>
                        )}
                        {compareSemesterInfo.description && (
                          <div className="flex items-center">
                            <span className="font-medium">Lớp:</span>
                            <span className="ml-2">{compareSemesterInfo.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Thống kê - chỉ hiển thị cho admin và advisor */}
                {(isAdmin || isAdvisor) && sheetData && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 flex items-center">
                      <div className="mr-3 bg-blue-100 p-2 rounded-full">
                        <FaGraduationCap className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Lớp {selectedSheet}</p>
                        <p className="font-bold text-lg">{filteredData.length} sinh viên</p>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-3 flex items-center">
                      <div className="mr-3 bg-yellow-100 p-2 rounded-full">
                        <FaExclamationTriangle className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sinh viên bị cảnh báo</p>
                        <p className="font-bold text-lg">{countWarningStudents()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bảng dữ liệu */}
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
                  </div>
                ) : (
                  <>
                    {/* Hiển thị cho sinh viên */}
                    {isStudent ? (
                      <>
                        {studentData ? (
                          <div className="overflow-x-auto">
                            <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h3 className="text-lg font-medium text-blue-800 mb-2">
                                Thông tin của bạn - Lớp {selectedSheet}
                                {getSemesterDisplay() && (
                                  <span className="ml-2 text-base font-normal">
                                    ({getSemesterDisplay()})
                                  </span>
                                )}
                                {semesterInfo.description && (
                                  <div className="text-sm font-normal text-blue-600 mt-1">
                                    {semesterInfo.description}
                                  </div>
                                )}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {["Mã SV", "Họ và tên", "Ngày sinh", "Điểm TB học kỳ", "Tổng số tín chỉ tích lũy", "Điểm TB tích lũy"]
                                  .filter(columnKey => studentData[columnKey] !== undefined)
                                  .map((columnKey) => (
                                    <div key={columnKey} className="flex flex-col">
                                      <span className="text-sm text-gray-600">{columnKey}</span>
                                      <span className="font-medium">
                                        {studentData[columnKey] !== undefined ? studentData[columnKey] : "-"}
                                      </span>
                                    </div>
                                  ))
                                }
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-600">Trạng thái</span>
                                  <span className={`font-medium ${
                                    hasWarningStatus(studentData) ? "text-red-600" : "text-green-600"
                                  }`}>
                                    {studentData["MỨC CẢNH BÁO HỌC TẬP"] || "Bình thường"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Hiển thị bảng điểm chi tiết */}
                            <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg">
                              <h3 className="text-lg font-medium text-gray-800 mb-4">
                                Bảng điểm chi tiết
                              </h3>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số tín chỉ</th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {sheetData && sheetData.length > 0 && sheetData[0] && Object.entries(sheetData[0])
                                      .filter(([key, value]) => 
                                        // Lọc các trường là môn học (có trong hàng đầu tiên và không phải cột thông tin cơ bản)
                                        !["STT", "Mã SV", "Họ và tên", "Ngày sinh", "Tổng số TC trong học kỳ", "Điểm TB học kỳ", "Tổng số tín chỉ tích lũy", "Điểm TB tích lũy", "MỨC CẢNH BÁO HỌC TẬP"].includes(key) && 
                                        // Đảm bảo sinh viên có điểm cho môn học này
                                        studentData[key] !== undefined
                                      )
                                      .map(([subjectName, credits]) => (
                                        <tr key={subjectName}>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{subjectName}</td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">{credits?.toString()}</td>
                                          <td className={`px-3 py-2 whitespace-nowrap text-sm text-center ${
                                            Number(studentData[subjectName]) < 2 ? "text-red-600 font-medium" : "text-gray-900"
                                          }`}>
                                            {studentData[subjectName]?.toString() || "-"}
                                          </td>
                                        </tr>
                                      ))
                                    }
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            {/* Hiển thị cảnh báo nếu có */}
                            {hasWarningStatus(studentData) && (
                              <div className="p-4 mb-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                                <div className="flex items-center">
                                  <FaExclamationTriangle className="text-yellow-600 mr-2" />
                                  <h3 className="text-lg font-medium text-yellow-800">Cảnh báo học tập</h3>
                                </div>
                                <p className="mt-2 text-yellow-700">
                                  Bạn đang trong tình trạng {studentData["MỨC CẢNH BÁO HỌC TẬP"]}. 
                                  Vui lòng liên hệ với cố vấn học tập để được hỗ trợ.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : sheetData && sheetData.length > 0 ? (
                          <div className="text-center py-10">
                            <FaSearch className="mx-auto text-4xl text-gray-400 mb-3" />
                            <p className="text-gray-500">
                              Không tìm thấy thông tin của bạn trong lớp {selectedSheet}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Vui lòng chọn một lớp khác hoặc liên hệ với cố vấn học tập
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-gray-500">
                              Không có dữ liệu trong lớp {selectedSheet}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Hiển thị cho admin và advisor */
                      <div className="overflow-x-auto">
                        {sheetData && sheetData.length > 0 && filteredData.length > 0 ? (
                          <div className="bg-white rounded-lg shadow-md p-5 overflow-auto mb-5">
                            <table className="min-w-full bg-white">
                              <thead>
                                <tr className="bg-indigo-600 text-white">
                                  <th className="py-3 px-4 text-left">STT</th>
                                  <th className="py-3 px-4 text-left">{getColumnByType("id")}</th>
                                  <th className="py-3 px-4 text-left">{getColumnByType("name")}</th>
                                  <th className="py-3 px-4 text-left">Ngày sinh</th>
                                  <th className="py-3 px-4 text-center">Điểm TB học kỳ</th>
                                  <th className="py-3 px-4 text-center">Điểm TB tích lũy</th>
                                  <th className="py-3 px-4 text-center">Tín chỉ</th>
                                  <th className="py-3 px-4 text-center">{getColumnByType("warning") || "Trạng thái"}</th>
                                  {(userInfo?.role === "advisor" || userInfo?.role === "admin") && (
                                    <th className="py-3 px-4 text-right">Hành động</th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {filteredData.map((row, index) => {
                                  const idColumn = getColumnByType("id");
                                  const nameColumn = getColumnByType("name");
                                  const warningColumn = getColumnByType("warning");
                                  return (
                                  <tr
                                    key={index}
                                    className={`${
                                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                    } border-b hover:bg-gray-100 ${
                                      hasWarningStatus(row) ? "bg-red-50 hover:bg-red-100" : ""
                                    }`}
                                  >
                                    <td className="py-3 px-4">{row["STT"]}</td>
                                    <td className="py-3 px-4">{row[idColumn]}</td>
                                    <td className="py-3 px-4">{row[nameColumn]}</td>
                                    <td className="py-3 px-4">{row["Ngày sinh"]}</td>
                                    <td className="py-3 px-4 text-center">{row["Điểm TB học kỳ"]}</td>
                                    <td className="py-3 px-4 text-center">{row["Điểm TB tích lũy"]}</td>
                                    <td className="py-3 px-4 text-center">{row["Tổng số tín chỉ tích lũy"]}</td>
                                    <td
                                      className={`py-3 px-4 text-center ${
                                        hasWarningStatus(row) ? "text-red-600 font-medium" : "text-green-600"
                                      }`}
                                    >
                                      {row[warningColumn] || "Bình thường"}
                                    </td>
                                    {(userInfo?.role === "advisor" || userInfo?.role === "admin") && (
                                      <td className="py-3 px-4 text-right">
                                        <button
                                          onClick={() => handleViewDetail(row)}
                                          className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded inline-flex items-center text-sm mr-2"
                                          title="Xem chi tiết điểm"
                                        >
                                          <FaEye className="mr-1" /> Chi tiết
                                        </button>
                                        <button
                                          onClick={() => handleSendSupportEmail(row)}
                                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded inline-flex items-center text-sm"
                                          title="Gửi email hỗ trợ"
                                          disabled={!hasWarningStatus(row)}
                                        >
                                          <FaEnvelope className="mr-1" /> Hỗ trợ
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                )})}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <FaSearch className="mx-auto text-4xl text-gray-400 mb-3" />
                            <p className="text-gray-500">
                              {searchTerm || filterWarningOnly 
                                ? "Không tìm thấy sinh viên nào khớp với điều kiện tìm kiếm" 
                                : "Không có dữ liệu trong lớp này"}
                            </p>
                            {(searchTerm || filterWarningOnly) && (
                              <button 
                                onClick={() => {
                                  setSearchTerm("");
                                  setFilterWarningOnly(false);
                                }}
                                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                              >
                                Hiển thị tất cả
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <FaFileExcel className="text-gray-400 text-5xl mb-4" />
                <p className="text-gray-500">Vui lòng chọn file Excel</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Hiển thị layout theo vai trò người dùng
  if (isAdvisor) {
    return (
      <AdvisorLayout>
        {renderContent()}
        {/* Email Support Modal */}
        {showEmailModal && selectedStudent && (
          <SupportEmailTemplate
            studentData={selectedStudent}
            advisorInfo={userInfo || {}}
            onClose={() => setShowEmailModal(false)}
          />
        )}
        {/* Chi tiết điểm sinh viên Modal */}
        {viewingDetail && sheetData && sheetData.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Bảng điểm chi tiết - {viewingDetail["Họ và tên"]} ({viewingDetail["Mã SV"]})
                  {getSemesterDisplay() && (
                    <span className="text-base font-normal text-blue-600 ml-2">
                      | {getSemesterDisplay()}
                    </span>
                  )}
                </h3>
                <button 
                  onClick={handleCloseDetail}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[70vh]">
                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Mã sinh viên</div>
                    <div className="font-semibold">{viewingDetail["Mã SV"]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Họ và tên</div>
                    <div className="font-semibold">{viewingDetail["Họ và tên"]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Ngày sinh</div>
                    <div>{viewingDetail["Ngày sinh"]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Điểm TB học kỳ</div>
                    <div className="font-semibold text-blue-600">{viewingDetail["Điểm TB học kỳ"]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Điểm TB tích lũy</div>
                    <div className="font-semibold text-blue-600">{viewingDetail["Điểm TB tích lũy"]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Tín chỉ tích lũy</div>
                    <div className="font-semibold">{viewingDetail["Tổng số tín chỉ tích lũy"]}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-gray-500">Trạng thái</div>
                    <div className={`font-semibold ${hasWarningStatus(viewingDetail) ? "text-red-600" : "text-green-600"}`}>
                      {viewingDetail["MỨC CẢNH BÁO HỌC TẬP"] || "Bình thường"}
                    </div>
                  </div>
                </div>
                
                {/* Bảng điểm chi tiết */}
                <h4 className="text-lg font-medium text-gray-800 mb-3">Điểm các môn học</h4>
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                        <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số tín chỉ</th>
                        <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sheetData[0] && Object.entries(sheetData[0])
                        .filter(([key, value]) => 
                          // Lọc các trường là môn học (có trong hàng đầu tiên và không phải cột thông tin cơ bản)
                          !["STT", "Mã SV", "Họ và tên", "Ngày sinh", "Tổng số TC trong học kỳ", "Điểm TB học kỳ", "Tổng số tín chỉ tích lũy", "Điểm TB tích lũy", "MỨC CẢNH BÁO HỌC TẬP"].includes(key) && 
                          // Đảm bảo sinh viên có điểm cho môn học này
                          viewingDetail[key] !== undefined && viewingDetail[key] !== ""
                        )
                        .map(([subjectName, credits]) => (
                          <tr key={subjectName}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{subjectName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">{credits?.toString()}</td>
                            <td className={`px-3 py-2 whitespace-nowrap text-sm text-center ${
                              Number(viewingDetail[subjectName]) < 2 ? "text-red-600 font-medium" : "text-gray-900"
                            }`}>
                              {viewingDetail[subjectName]?.toString() || "-"}
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
                
                {/* So sánh giữa 2 kỳ nếu đang ở chế độ so sánh */}
                {isComparing && compareSheetData.length > 0 && (
                  <div className="mb-6">
                    {(() => {
                      const compareData = getCompareStudentData(viewingDetail["Mã SV"]);
                      if (!compareData) {
                        return (
                          <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                            <p className="text-yellow-700">
                              Không tìm thấy dữ liệu sinh viên này trong file so sánh.
                            </p>
                          </div>
                        );
                      }
                      
                      // So sánh trực tiếp giữa file hiện tại và file được chọn để so sánh
                      const fileA = viewingDetail;  // File hiện tại đang xem
                      const fileB = compareData;    // File được chọn để so sánh
                      
                      const comparison = compareStudentData(fileB, fileA);
                      
                      if (!comparison || !comparison.hasChanges) {
                        return (
                          <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                            <p className="text-gray-700">
                              Không có sự khác biệt đáng kể nào giữa hai file.
                            </p>
                          </div>
                        );
                      }
                      
                      // Lấy tên hiển thị cho từng file
                      const fileAName = selectedFile || "File hiện tại";
                      const fileBName = compareFile || "File so sánh";
                      
                      return (
                        <div>
                          <h4 className="text-lg font-medium text-gray-800 mb-3">So sánh dữ liệu</h4>
                          
                          {/* Hiển thị thay đổi chỉ số quan trọng */}
                          {Object.keys(comparison.summary).length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-700 mb-2">Các chỉ số quan trọng</h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Chỉ số
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {fileAName}
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {fileBName}
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thay đổi
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {Object.entries(comparison.summary).map(([field, data]: [string, any]) => (
                                      <tr key={field}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                          {field}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                                          {data.previous}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                                          {data.current}
                                        </td>
                                        <td className={`px-3 py-2 whitespace-nowrap text-sm text-center font-medium ${
                                          data.improved ? "text-green-600" : data.worsened ? "text-red-600" : "text-gray-600"
                                        }`}>
                                          {typeof data.difference === 'string' && data.difference.match(/^-?\d/) 
                                            ? (data.difference.startsWith('-') ? '' : '+') + data.difference
                                            : data.difference
                                          }
                                          {data.improved && " ↑"}
                                          {data.worsened && " ↓"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Hiển thị thay đổi điểm các môn học */}
                          {Object.keys(comparison.subjects).length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Điểm số các môn học</h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Môn học
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {fileAName}
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {fileBName}
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thay đổi
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {Object.entries(comparison.subjects).map(([subject, data]: [string, any]) => (
                                      <tr key={subject}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                          {subject}
                                        </td>
                                        <td className={`px-3 py-2 whitespace-nowrap text-sm text-center ${
                                          data.previous < 2 ? "text-red-600" : ""
                                        }`}>
                                          {data.previous}
                                        </td>
                                        <td className={`px-3 py-2 whitespace-nowrap text-sm text-center ${
                                          data.current < 2 ? "text-red-600" : ""
                                        }`}>
                                          {data.current}
                                        </td>
                                        <td className={`px-3 py-2 whitespace-nowrap text-sm text-center font-medium ${
                                          data.improved ? "text-green-600" : "text-red-600"
                                        }`}>
                                          {data.difference.startsWith('-') ? '' : '+'}
                                          {data.difference}
                                          {data.improved && " ↑"}
                                          {data.worsened && " ↓"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={handleCloseDetail}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Đóng
                </button>
                {hasWarningStatus(viewingDetail) && (
                  <button
                    onClick={() => {
                      handleSendSupportEmail(viewingDetail);
                      handleCloseDetail();
                    }}
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
                  >
                    <FaEnvelope className="mr-1" /> Gửi email hỗ trợ
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AdvisorLayout>
    );
  } else if (isStudent) {
    return (
      <StudentLayout>
        {renderContent()}
        {/* Email Support Modal */}
        {showEmailModal && selectedStudent && (
          <SupportEmailTemplate
            studentData={selectedStudent}
            advisorInfo={userInfo || {}}
            onClose={() => setShowEmailModal(false)}
          />
        )}
      </StudentLayout>
    );
  } else {
    return (
      <MainLayout>
        {renderContent()}
        {/* Email Support Modal */}
        {showEmailModal && selectedStudent && (
          <SupportEmailTemplate
            studentData={selectedStudent}
            advisorInfo={userInfo || {}}
            onClose={() => setShowEmailModal(false)}
          />
        )}
        {/* Chi tiết điểm sinh viên Modal - Giống phần Advisor */}
        {viewingDetail && sheetData && sheetData.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Bảng điểm chi tiết - {viewingDetail["Họ và tên"]} ({viewingDetail["Mã SV"]})
                  {getSemesterDisplay() && (
                    <span className="text-base font-normal text-blue-600 ml-2">
                      | {getSemesterDisplay()}
                    </span>
                  )}
                </h3>
                <button 
                  onClick={handleCloseDetail}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[70vh]">
                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Mã sinh viên</div>
                    <div className="font-semibold">{viewingDetail["Mã SV"]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Họ và tên</div>
                    <div className="font-semibold">{viewingDetail["Họ và tên"]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Ngày sinh</div>
                    <div>{viewingDetail["Ngày sinh"]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Điểm TB học kỳ</div>
                    <div className="font-semibold text-blue-600">{viewingDetail["Điểm TB học kỳ"]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Điểm TB tích lũy</div>
                    <div className="font-semibold text-blue-600">{viewingDetail["Điểm TB tích lũy"]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Tín chỉ tích lũy</div>
                    <div className="font-semibold">{viewingDetail["Tổng số tín chỉ tích lũy"]}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-gray-500">Trạng thái</div>
                    <div className={`font-semibold ${hasWarningStatus(viewingDetail) ? "text-red-600" : "text-green-600"}`}>
                      {viewingDetail["MỨC CẢNH BÁO HỌC TẬP"] || "Bình thường"}
                    </div>
                  </div>
                </div>
                
                {/* Bảng điểm chi tiết */}
                <h4 className="text-lg font-medium text-gray-800 mb-3">Điểm các môn học</h4>
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                        <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số tín chỉ</th>
                        <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sheetData[0] && Object.entries(sheetData[0])
                        .filter(([key, value]) => 
                          // Lọc các trường là môn học (có trong hàng đầu tiên và không phải cột thông tin cơ bản)
                          !["STT", "Mã SV", "Họ và tên", "Ngày sinh", "Tổng số TC trong học kỳ", "Điểm TB học kỳ", "Tổng số tín chỉ tích lũy", "Điểm TB tích lũy", "MỨC CẢNH BÁO HỌC TẬP"].includes(key) && 
                          // Đảm bảo sinh viên có điểm cho môn học này
                          viewingDetail[key] !== undefined && viewingDetail[key] !== ""
                        )
                        .map(([subjectName, credits]) => (
                          <tr key={subjectName}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{subjectName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">{credits?.toString()}</td>
                            <td className={`px-3 py-2 whitespace-nowrap text-sm text-center ${
                              Number(viewingDetail[subjectName]) < 2 ? "text-red-600 font-medium" : "text-gray-900"
                            }`}>
                              {viewingDetail[subjectName]?.toString() || "-"}
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
                
                {/* So sánh giữa 2 kỳ nếu đang ở chế độ so sánh */}
                {isComparing && compareSheetData.length > 0 && (
                  <div className="mb-6">
                    {(() => {
                      const compareData = getCompareStudentData(viewingDetail["Mã SV"]);
                      if (!compareData) {
                        return (
                          <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                            <p className="text-yellow-700">
                              Không tìm thấy dữ liệu sinh viên này trong file so sánh.
                            </p>
                          </div>
                        );
                      }
                      
                      // So sánh trực tiếp giữa file hiện tại và file được chọn để so sánh
                      const fileA = viewingDetail;  // File hiện tại đang xem
                      const fileB = compareData;    // File được chọn để so sánh
                      
                      const comparison = compareStudentData(fileB, fileA);
                      
                      if (!comparison || !comparison.hasChanges) {
                        return (
                          <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                            <p className="text-gray-700">
                              Không có sự khác biệt đáng kể nào giữa hai file.
                            </p>
                          </div>
                        );
                      }
                      
                      // Lấy tên hiển thị cho từng file
                      const fileAName = selectedFile || "File hiện tại";
                      const fileBName = compareFile || "File so sánh";
                      
                      return (
                        <div>
                          <h4 className="text-lg font-medium text-gray-800 mb-3">So sánh dữ liệu</h4>
                          
                          {/* Hiển thị thay đổi chỉ số quan trọng */}
                          {Object.keys(comparison.summary).length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-700 mb-2">Các chỉ số quan trọng</h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Chỉ số
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {fileAName}
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {fileBName}
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thay đổi
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {Object.entries(comparison.summary).map(([field, data]: [string, any]) => (
                                      <tr key={field}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                          {field}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                                          {data.previous}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                                          {data.current}
                                        </td>
                                        <td className={`px-3 py-2 whitespace-nowrap text-sm text-center font-medium ${
                                          data.improved ? "text-green-600" : data.worsened ? "text-red-600" : "text-gray-600"
                                        }`}>
                                          {typeof data.difference === 'string' && data.difference.match(/^-?\d/) 
                                            ? (data.difference.startsWith('-') ? '' : '+') + data.difference
                                            : data.difference
                                          }
                                          {data.improved && " ↑"}
                                          {data.worsened && " ↓"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Hiển thị thay đổi điểm các môn học */}
                          {Object.keys(comparison.subjects).length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Điểm số các môn học</h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Môn học
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {fileAName}
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {fileBName}
                                      </th>
                                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thay đổi
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {Object.entries(comparison.subjects).map(([subject, data]: [string, any]) => (
                                      <tr key={subject}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                          {subject}
                                        </td>
                                        <td className={`px-3 py-2 whitespace-nowrap text-sm text-center ${
                                          data.previous < 2 ? "text-red-600" : ""
                                        }`}>
                                          {data.previous}
                                        </td>
                                        <td className={`px-3 py-2 whitespace-nowrap text-sm text-center ${
                                          data.current < 2 ? "text-red-600" : ""
                                        }`}>
                                          {data.current}
                                        </td>
                                        <td className={`px-3 py-2 whitespace-nowrap text-sm text-center font-medium ${
                                          data.improved ? "text-green-600" : "text-red-600"
                                        }`}>
                                          {data.difference.startsWith('-') ? '' : '+'}
                                          {data.difference}
                                          {data.improved && " ↑"}
                                          {data.worsened && " ↓"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={handleCloseDetail}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Đóng
                </button>
                {hasWarningStatus(viewingDetail) && (
                  <button
                    onClick={() => {
                      handleSendSupportEmail(viewingDetail);
                      handleCloseDetail();
                    }}
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
                  >
                    <FaEnvelope className="mr-1" /> Gửi email hỗ trợ
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    );
  }
};

export default AcademicWarning;
