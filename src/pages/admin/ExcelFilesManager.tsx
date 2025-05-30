import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import excelService, { ExcelFile } from "../../services/excelService";
import {
  FaFileExcel,
  FaUpload,
  FaTrash,
  FaDownload,
  FaEye,
  FaSpinner,
  FaSearch,
  FaFileImport,
  FaTable,
  FaGraduationCap,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";

const ExcelFilesManager: React.FC = () => {
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [sendingWarnings, setSendingWarnings] = useState<boolean>(false);
  
  // Form state cho upload file
  const [uploadForm, setUploadForm] = useState({
    semester: 1,
    year: new Date().getFullYear(),
    description: "",
    sendWarningEmails: true,  // Thêm tùy chọn gửi email cảnh báo
    studentTemplate: "academic_warning",
    advisorTemplate: "advisor_warning"
  });
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [selectedFileToupload, setSelectedFileToUpload] = useState<File | null>(null);
  const [warningResults, setWarningResults] = useState<any[]>([]);
  const [showWarningResults, setShowWarningResults] = useState<boolean>(false);

  // State cho modal kết quả gửi email
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningModalResults, setWarningModalResults] = useState<any>({});

  // State cho tùy chọn gửi email thủ công
  const [manualEmailOptions, setManualEmailOptions] = useState({
    studentTemplate: "academic_warning",
    advisorTemplate: "advisor_warning"
  });

  // Lấy danh sách file Excel
  useEffect(() => {
    fetchExcelFiles();
  }, []);

  const fetchExcelFiles = async () => {
    try {
      setLoading(true);
      const fetchedFiles = await excelService.getAllExcelFiles();
      setFiles(fetchedFiles);
      setError(null);
    } catch (err) {
      console.error("Error fetching excel files:", err);
      setError("Không thể tải danh sách file Excel. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setSelectedFileToUpload(file);
    setShowUploadForm(true);
  };
  
  // Xử lý thay đổi trong form upload
  const handleUploadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: name === 'semester' || name === 'year' ? parseInt(value) : value
    });
  };

  // Xử lý thay đổi checkbox gửi email
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: checked
    });
  };

  // Xử lý upload file
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFileToupload) {
      setError("Vui lòng chọn file để tải lên");
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      setWarningResults([]);
      setShowWarningResults(false);
      
      const formData = new FormData();
      formData.append('file', selectedFileToupload);
      formData.append('semester', uploadForm.semester.toString());
      formData.append('year', uploadForm.year.toString());
      
      if (uploadForm.description) {
        formData.append('description', uploadForm.description);
      }
      
      // Gọi API upload với tùy chọn gửi email cảnh báo
      let response;
      if (uploadForm.sendWarningEmails) {
        response = await excelService.uploadExcelFileWithParamsAndWarning(
          formData, 
          true,
          uploadForm.studentTemplate,
          uploadForm.advisorTemplate
        );
        
        // Lưu kết quả gửi email để hiển thị
        if (response.warningResults && response.warningResults.length > 0) {
          setWarningResults(response.warningResults);
          setShowWarningResults(true);
        }
      } else {
        response = await excelService.uploadExcelFileWithParams(formData);
      }
      
      // Refresh danh sách file sau khi upload
      await fetchExcelFiles();
      
      setSuccessMessage(`File ${selectedFileToupload.name} đã được tải lên thành công`);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Không thể tải lên file. Vui lòng thử lại sau.");
    } finally {
      setUploading(false);
    }
  };

  // Xử lý xóa file
  const handleDeleteFile = async (fileName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa file ${fileName}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await excelService.deleteExcelFile(fileName);
      
      // Refresh danh sách file sau khi xóa
      await fetchExcelFiles();
      
      if (selectedFile === fileName) {
        setSelectedFile(null);
        setFilePreview([]);
        setSelectedSheet(null);
        setAvailableSheets([]);
      }
      
      setSuccessMessage(`File ${fileName} đã được xóa thành công`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error deleting file:", err);
      setError("Không thể xóa file. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn file để xem
  const handleSelectFile = async (fileName: string) => {
    try {
      setSelectedFile(fileName);
      setSelectedSheet(null);
      setFilePreview([]);
      setPreviewLoading(true);
      
      // Lấy thông tin về các sheets (lớp) trong file
      const excelData = await excelService.getExcelData(fileName);
      setAvailableSheets(excelData.sheets || []);
      
      // Nếu có ít nhất một sheet, chọn sheet đầu tiên
      if (excelData.sheets && excelData.sheets.length > 0) {
        setSelectedSheet(excelData.currentSheet || excelData.sheets[0]);
        await loadSheetData(fileName, excelData.currentSheet || excelData.sheets[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error selecting file:", err);
      setError(`Không thể tải thông tin file ${fileName}. Vui lòng thử lại sau.`);
      setAvailableSheets([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Xử lý chọn sheet (lớp)
  const handleSelectSheet = async (sheetName: string) => {
    if (!selectedFile) return;
    
    setSelectedSheet(sheetName);
    await loadSheetData(selectedFile, sheetName);
  };

  // Tải dữ liệu từ sheet (lớp)
  const loadSheetData = async (fileName: string, sheetName: string) => {
    try {
      setPreviewLoading(true);
      
      const response = await excelService.getSheetData(fileName, sheetName);
      console.log("Dữ liệu API trả về:", response);
      
      // Xử lý cấu trúc dữ liệu từ API
      let processedData: any[] = [];
      
      if (Array.isArray(response)) {
        processedData = response;
      } else if (response && typeof response === 'object') {
        if (response.data && Array.isArray(response.data)) {
          processedData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
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
      }
      
      setFilePreview(processedData);
      setError(null);
    } catch (err) {
      console.error(`Error loading sheet data for ${sheetName}:`, err);
      setError(`Không thể tải dữ liệu lớp ${sheetName}. Vui lòng thử lại sau.`);
      setFilePreview([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Lọc file theo tên
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.original_name && file.original_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format kích thước file
  const formatFileSize = (size: string | number): string => {
    if (typeof size === 'string') {
      return size;
    }
    
    const kb = size / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  // Tìm file đang được chọn trong danh sách file để hiển thị thông tin học kỳ
  const getSelectedFileInfo = () => {
    return files.find(file => file.name === selectedFile);
  };

  // Xác định các cột dữ liệu quan trọng
  const getColumnByType = (type: "id" | "name" | "warning" | "gpa" | "credits") => {
    if (!filePreview || filePreview.length === 0) {
      console.log(`getColumnByType: Không có dữ liệu để xác định cột ${type}`);
      return "";
    }
    
    // Bỏ qua hàng đầu tiên nếu nó chứa thông tin môn học và số tín chỉ
    const isFirstRowCreditInfo = filePreview.length > 0 && !filePreview[0]["STT"];
    const dataRow = isFirstRowCreditInfo ? filePreview[1] : filePreview[0];
    if (!dataRow) {
      console.log(`getColumnByType: Không tìm thấy hàng dữ liệu để xác định cột ${type}`);
      return "";
    }
    
    const columnMappings: {[key: string]: string[]} = {
      id: ["Mã SV", "MaSV", "MSSV", "Ma SV", "Mã sinh viên", "MaSinhVien", "Ma sinh vien", "mã sv", "Mã", "ID", "Student ID", "StudentID", "student_id", "student_code"],
      name: ["Họ và tên", "HoTen", "Ho va ten", "Họ tên", "HọTên", "Tên sinh viên", "Ten sinh vien", "Tên SV", "Ten SV", "Student Name", "StudentName", "Full Name", "FullName", "name", "student_name", "họ tên", "hoten", "họ và tên", "ho va ten"],
      warning: ["MỨC CẢNH BÁO HỌC TẬP", "Cảnh báo học tập", "CanhBao", "MỨC CẢNH BÁO HỌC TẬP ĐÃ NHẬN KỲ TRƯỚC", "Mức cảnh báo", "Canh bao", "Muc canh bao", "CẢNH BÁO", "Canh Bao", "CB", "Warning", "Warning Level", "cảnh báo", "canh bao", "Cảnh báo", "mức cảnh báo", "Mức CB", "Học tập", "Hoc tap", "học tập", "mức độ cảnh báo", "Mức độ"],
      gpa: ["Điểm TB tích lũy", "DiemTBTichLuy", "Diem TB tich luy", "ĐiểmTBTíchLũy", "GPA", "Điểm tích lũy", "Diem tich luy", "Điểm trung bình tích lũy", "ĐTBTL", "DTBTL", "điểm tb tích lũy", "diem tb tich luy"],
      credits: ["Tổng số tín chỉ tích lũy", "TongTC", "TC tích lũy", "Tổng số TC tích lũy", "Tín chỉ tích lũy", "Tin chi tich luy", "Tổng tín chỉ", "Tong tin chi", "Credits", "Total Credits", "TotalCredits", "total_credits", "tổng số tín chỉ", "tong so tin chi", "TC", "tín chỉ"]
    };
    
    // Tìm cột phù hợp - chuẩn hóa tên cột để so sánh không phân biệt hoa thường
    const allColumns = Object.keys(dataRow);
    const possibleColumns = columnMappings[type];
    
    console.log(`getColumnByType: Đang tìm kiếm cột ${type} trong các cột:`, allColumns);
    
    // Tìm theo tên chính xác trước
    for (const col of possibleColumns) {
      const exactMatch = allColumns.find(column => column.toLowerCase() === col.toLowerCase());
      if (exactMatch) {
        console.log(`getColumnByType: Đã tìm thấy cột ${type} (khớp chính xác) -> ${exactMatch}`);
        return exactMatch;
      }
    }
    
    // Tìm theo tên cột chứa các từ khóa
    const keywordMap = {
      id: ["mã", "ma", "msv", "mssv", "id", "code"],
      name: ["tên", "ten", "họ", "ho", "name", "sinh viên", "sinh vien"],
      warning: ["cảnh báo", "canh bao", "cb", "warning", "mức", "muc"],
      gpa: ["điểm", "diem", "tb", "gpa", "trung bình", "trung binh", "tích lũy", "tich luy"],
      credits: ["tín chỉ", "tin chi", "tc", "credit", "tổng", "tong"]
    };
    
    const keywords = keywordMap[type] || [];
    for (const keyword of keywords) {
      const matchByKeyword = allColumns.find(column => 
        column.toLowerCase().includes(keyword.toLowerCase()));
      if (matchByKeyword) {
        console.log(`getColumnByType: Đã tìm thấy cột ${type} (khớp từ khóa "${keyword}") -> ${matchByKeyword}`);
        return matchByKeyword;
      }
    }
    
    // Nếu vẫn không tìm thấy, thử các phương pháp đặc biệt cho từng loại
    if (type === "id" && allColumns.includes("ID")) {
      return "ID";
    }
    
    if (type === "id" && allColumns.some(col => /^\d+$/.test(col))) {
      // Tìm cột có tên là số (thường là ID sinh viên)
      const idColumn = allColumns.find(col => /^\d+$/.test(col));
      if (idColumn) {
        console.log(`getColumnByType: Đã tìm thấy cột ${type} (dạng số) -> ${idColumn}`);
        return idColumn;
      }
    }
    
    console.log(`getColumnByType: Không tìm thấy cột ${type}, trả về mặc định ${possibleColumns[0] || "Không xác định"}`);
    return possibleColumns[0] || ""; // Trả về cột mặc định nếu không tìm thấy
  };

  // Xác định các cột quan trọng
  const getImportantColumns = () => {
    if (!filePreview || filePreview.length === 0) return [];

    // Các cột quan trọng cần hiển thị
    const importantColumns = [
      "STT",
      "Mã SV",
      "Họ và tên",
      "Ngày sinh",
      "Điểm TB học kỳ",
      "Tổng số TC tích lũy",
      "Điểm TB tích lũy",
      "MỨC CẢNH BÁO HỌC TẬP ĐÃ NHẬN KỲ TRƯỚC"
    ];

    // Lấy tất cả các cột từ dữ liệu
    const allColumns = Object.keys(filePreview[0] || {});
    
    // Lọc để lấy các cột quan trọng có trong dữ liệu
    return importantColumns.filter(col => allColumns.includes(col));
  };

  // Xử lý gửi email cảnh báo học tập thủ công
  const handleSendAcademicWarnings = async () => {
    if (!selectedFile || !selectedSheet) {
      setError("Vui lòng chọn file và lớp để gửi cảnh báo học tập");
      return;
    }
    
    const fileInfo = getSelectedFileInfo();
    if (!fileInfo || !fileInfo.semester || !fileInfo.year) {
      setError("File không có thông tin học kỳ và năm học");
      return;
    }

    try {
      setSendingWarnings(true);
      setError(null);
      
      const result = await excelService.sendAcademicWarning(
        selectedFile,
        selectedSheet,
        fileInfo.semester,
        fileInfo.year,
        manualEmailOptions.studentTemplate,
        manualEmailOptions.advisorTemplate
      );
      
      setSendingWarnings(false);
      
      // Hiển thị kết quả gửi email
      setWarningModalResults({
        fileName: fileInfo.original_name || selectedFile,
        sheet: selectedSheet,
        result: result
      });
      setShowWarningModal(true);
      
    } catch (error) {
      console.error("Error sending academic warnings:", error);
      setError("Không thể gửi email cảnh báo học tập. Vui lòng thử lại sau.");
      setSendingWarnings(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-900">Quản lý file điểm cảnh báo</h1>
          
          <div className="flex items-center">
            <label htmlFor="file-upload" className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center">
              <FaUpload className="mr-2" />
              {uploading ? "Đang tải lên..." : "Tải lên file Excel"}
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Form upload file */}
        {showUploadForm && selectedFileToupload && (
          <div className="bg-white p-5 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaFileExcel className="text-green-600 mr-2"/>
              Tải lên file: {selectedFileToupload.name}
            </h2>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Học kỳ <span className="text-red-600">*</span>
                  </label>
                  <select 
                    name="semester"
                    value={uploadForm.semester}
                    onChange={handleUploadFormChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value={1}>Học kỳ 1</option>
                    <option value={2}>Học kỳ 2</option>
                    <option value={3}>Học kỳ 3</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Năm học <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="number" 
                    name="year"
                    value={uploadForm.year}
                    onChange={handleUploadFormChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                    min="2000"
                    max="2100"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea 
                  name="description"
                  value={uploadForm.description as string}
                  onChange={handleUploadFormChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                  rows={3}
                  placeholder="Nhập mô tả về file Excel này (ví dụ: Dữ liệu điểm lớp CNTT K62)"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendWarningEmails"
                  name="sendWarningEmails"
                  checked={uploadForm.sendWarningEmails}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="sendWarningEmails" className="text-sm font-medium text-gray-700">
                  Tự động gửi email thông báo cho sinh viên bị cảnh báo học tập
                </label>
              </div>
              
              {/* Tùy chọn template email khi checkbox gửi email được chọn */}
              {uploadForm.sendWarningEmails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 bg-blue-50 p-3 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template email cho sinh viên
                    </label>
                    <select
                      name="studentTemplate"
                      value={uploadForm.studentTemplate}
                      onChange={handleUploadFormChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      <option value="academic_warning">Thông báo cảnh báo học tập chi tiết</option>
                      <option value="warning_student">Thông báo cảnh báo học tập</option>
                      <option value="support_student">Hỗ trợ sinh viên bị cảnh báo</option>
                      <option value="support_student_html">Hỗ trợ sinh viên (HTML)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template email cho cố vấn học tập
                    </label>
                    <select
                      name="advisorTemplate"
                      value={uploadForm.advisorTemplate}
                      onChange={handleUploadFormChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      <option value="advisor_warning">Thông báo chi tiết cho cố vấn</option>
                      <option value="warning_advisor">Danh sách sinh viên cảnh báo</option>
                      <option value="admin_notification">Thông báo từ Admin</option>
                    </select>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setSelectedFileToUpload(null);
                    setWarningResults([]);
                    setShowWarningResults(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  disabled={uploading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                  disabled={uploading}
                >
                  {uploading ? <FaSpinner className="animate-spin mr-2" /> : <FaUpload className="mr-2" />}
                  {uploading ? "Đang tải lên..." : "Tải lên"}
                </button>
              </div>
            </form>
            
            {/* Hiển thị kết quả gửi email cảnh báo */}
            {showWarningResults && warningResults.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-indigo-700 mb-2">Kết quả gửi email cảnh báo học tập</h3>
                
                <div className="bg-blue-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="py-1 px-2 text-left text-xs font-medium text-gray-600">Lớp</th>
                        <th className="py-1 px-2 text-left text-xs font-medium text-gray-600">Trạng thái</th>
                        <th className="py-1 px-2 text-left text-xs font-medium text-gray-600">Số sinh viên</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warningResults.map((result, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-blue-100 bg-opacity-50" : ""}>
                          <td className="py-1 px-2 text-sm">{result.sheet}</td>
                          <td className="py-1 px-2 text-sm">
                            {result.result.success ? (
                              <span className="text-green-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Thành công
                              </span>
                            ) : (
                              <span className="text-red-600">Lỗi</span>
                            )}
                          </td>
                          <td className="py-1 px-2 text-sm">
                            {result.result.data && result.result.data.studentsWarned 
                              ? result.result.data.studentsWarned 
                              : (result.result.message.includes("Không có sinh viên bị cảnh báo") ? "0" : "-")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setShowUploadForm(false);
                      setSelectedFileToUpload(null);
                      setWarningResults([]);
                      setShowWarningResults(false);
                    }}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thông báo lỗi và thành công */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Danh sách file */}
          <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm file..."
                  className="w-full p-2 pl-10 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[500px]">
                {filteredFiles.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 text-left">Tên file</th>
                        <th className="py-2 px-3 text-left">Kỳ/Năm</th>
                        <th className="py-2 px-3 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file, index) => (
                        <tr 
                          key={index} 
                          className={`border-b hover:bg-gray-50 ${selectedFile === file.name ? 'bg-blue-50' : ''}`}
                        >
                          <td className="py-3 px-3">
                            <div 
                              className="flex items-center cursor-pointer" 
                              onClick={() => handleSelectFile(file.name)}
                            >
                              <FaFileExcel className="text-green-600 mr-2" />
                              <div>
                                <div className="font-medium truncate max-w-[150px]">
                                  {file.original_name || file.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-sm">
                            {file.semester && file.year ? (
                              <div className="flex items-center">
                                <FaCalendarAlt className="text-blue-600 mr-1" />
                                <span>Kỳ {file.semester}/{file.year}</span>
                              </div>
                            ) : "-"}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleSelectFile(file.name)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Xem file"
                              >
                                <FaEye />
                              </button>
                              <a
                                href={`http://localhost:3000/excel/${file.name}`}
                                download
                                className="text-green-600 hover:text-green-800"
                                title="Tải xuống"
                              >
                                <FaDownload />
                              </a>
                              <button
                                onClick={() => handleDeleteFile(file.name)}
                                className="text-red-600 hover:text-red-800"
                                title="Xóa file"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    {searchTerm ? (
                      <>
                        <FaSearch className="text-4xl mb-2 text-gray-400" />
                        <p>Không tìm thấy file nào khớp với "{searchTerm}"</p>
                      </>
                    ) : (
                      <>
                        <FaFileExcel className="text-4xl mb-2 text-gray-400" />
                        <p>Chưa có file Excel nào</p>
                        <p className="text-sm mt-2">Hãy tải lên file đầu tiên</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Xem dữ liệu file */}
          <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {selectedFile ? `Xem file: ${getSelectedFileInfo()?.original_name || selectedFile}` : "Xem dữ liệu file"}
              </h2>
              
              {/* Chọn lớp (sheet) */}
              {selectedFile && availableSheets.length > 0 && (
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-600">Chọn lớp:</span>
                  <div className="relative">
                    <select
                      value={selectedSheet || ""}
                      onChange={(e) => handleSelectSheet(e.target.value)}
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
                  
                  {/* Nút gửi email cảnh báo học tập */}
                  <div className="flex items-center">
                    <button
                      onClick={handleSendAcademicWarnings}
                      disabled={sendingWarnings || !selectedFile || !selectedSheet}
                      className="ml-3 px-2 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center text-sm"
                      title="Gửi email cảnh báo học tập cho sinh viên"
                    >
                      {sendingWarnings ? (
                        <>
                          <FaSpinner className="animate-spin mr-1" />
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <FaFileExcel className="mr-1" />
                          <span>Gửi cảnh báo</span>
                        </>
                      )}
                    </button>
                    
                    {/* Dropdown cài đặt template email */}
                    <div className="relative ml-1">
                      <button
                        type="button"
                        className="p-1 text-gray-500 hover:text-indigo-600 focus:outline-none"
                        onClick={() => document.getElementById('template-dropdown')?.classList.toggle('hidden')}
                        title="Cài đặt template email"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <div id="template-dropdown" className="hidden absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 p-3 border">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Cài đặt template email</h4>
                        
                        <div className="mb-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Template cho sinh viên
                          </label>
                          <select
                            value={manualEmailOptions.studentTemplate}
                            onChange={(e) => setManualEmailOptions({...manualEmailOptions, studentTemplate: e.target.value})}
                            className="w-full p-1 text-sm border rounded-lg focus:outline-none focus:border-indigo-500"
                          >
                            <option value="academic_warning">Thông báo cảnh báo học tập chi tiết</option>
                            <option value="warning_student">Thông báo cảnh báo học tập</option>
                            <option value="support_student">Hỗ trợ sinh viên bị cảnh báo</option>
                            <option value="support_student_html">Hỗ trợ sinh viên (HTML)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Template cho cố vấn
                          </label>
                          <select
                            value={manualEmailOptions.advisorTemplate}
                            onChange={(e) => setManualEmailOptions({...manualEmailOptions, advisorTemplate: e.target.value})}
                            className="w-full p-1 text-sm border rounded-lg focus:outline-none focus:border-indigo-500"
                          >
                            <option value="advisor_warning">Thông báo chi tiết cho cố vấn</option>
                            <option value="warning_advisor">Danh sách sinh viên cảnh báo</option>
                            <option value="admin_notification">Thông báo từ Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {previewLoading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
              </div>
            ) : selectedFile && selectedSheet ? (
              <div className="overflow-x-auto">
                {filePreview && filePreview.length > 0 && Object.keys(filePreview[0] || {}).length > 0 ? (
                  <>
                    {/* Thông tin file */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <FaFileExcel className="text-green-600 mr-2" />
                        <h3 className="text-lg font-medium text-blue-800">
                          {getSelectedFileInfo()?.original_name || selectedFile}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Thông tin học kỳ */}
                        <div className="flex items-start">
                          <FaCalendarAlt className="text-blue-600 mr-2 mt-1" />
                          <div>
                            <p className="font-medium">Học kỳ:</p>
                            <p>{getSelectedFileInfo()?.semester || "-"}/{getSelectedFileInfo()?.year || "-"}</p>
                          </div>
                        </div>
                        
                        {/* Thông tin lớp */}
                        <div className="flex items-start">
                          <FaGraduationCap className="text-blue-600 mr-2 mt-1" />
                          <div>
                            <p className="font-medium">Lớp:</p>
                            <p>{selectedSheet}</p>
                          </div>
                        </div>
                        
                        {/* Tổng số sinh viên */}
                        <div className="flex items-start">
                          <FaTable className="text-blue-600 mr-2 mt-1" />
                          <div>
                            <p className="font-medium">Số sinh viên:</p>
                            <p>{
                              (() => {
                                // Kiểm tra hàng đầu tiên có phải là metadata không
                                const isFirstRowMetadata = filePreview.length > 0 && 
                                  (!filePreview[0]["STT"] && !filePreview[0][getColumnByType("id")]);
                                
                                return isFirstRowMetadata ? filePreview.length - 1 : filePreview.length;
                              })()
                            }</p>
                          </div>
                        </div>
                        
                        {/* Mô tả */}
                        {getSelectedFileInfo()?.description && (
                          <div className="flex items-start md:col-span-2">
                            <FaInfoCircle className="text-blue-600 mr-2 mt-1" />
                            <div>
                              <p className="font-medium">Mô tả:</p>
                              <p>{getSelectedFileInfo()?.description}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Thông tin sinh viên cảnh báo */}
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 mt-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-medium">Cảnh báo học tập:</p>
                            <p className="text-red-600 font-medium">
                              {(() => {
                                // Đếm số sinh viên bị cảnh báo học tập
                                if (!filePreview || filePreview.length === 0) return 0;
                                
                                const warningColumn = getColumnByType("warning");
                                
                                // Kiểm tra hàng đầu tiên có phải là metadata không
                                const isFirstRowMetadata = filePreview.length > 0 && 
                                  (!filePreview[0]["STT"] && !filePreview[0][getColumnByType("id")]);
                                
                                const dataRows = isFirstRowMetadata ? filePreview.slice(1) : filePreview;
                                
                                const count = dataRows.filter(row => {
                                  if (!warningColumn || !row[warningColumn]) return false;
                                  const value = String(row[warningColumn]).toLowerCase();
                                  return value.includes("cảnh báo") || value.includes("canh bao");
                                }).length;
                                
                                return count;
                              })()}
                              {" "}sinh viên
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bảng tổng kết sinh viên bị cảnh báo học tập */}
                    {(() => {
                      // Lấy danh sách sinh viên bị cảnh báo học tập
                      const warningColumn = getColumnByType("warning");
                      const idColumn = getColumnByType("id");
                      const nameColumn = getColumnByType("name");
                      
                      // Tìm các cột dữ liệu khác
                      const findColumnByKeywords = (keywords: string[]): string => {
                        if (!filePreview || filePreview.length === 0) return "";
                        
                        // Lấy danh sách tất cả các cột
                        const allColumns = Object.keys(filePreview[0] || {});
                        
                        // Tìm cột phù hợp nhất
                        for (const keyword of keywords) {
                          const exactMatch = allColumns.find(col => 
                            col.toLowerCase() === keyword.toLowerCase());
                          if (exactMatch) return exactMatch;
                          
                          const partialMatch = allColumns.find(col => 
                            col.toLowerCase().includes(keyword.toLowerCase()));
                          if (partialMatch) return partialMatch;
                        }
                        
                        return "";
                      };
                      
                      const birthDateColumn = findColumnByKeywords(["Ngày sinh", "NgaySinh", "DOB", "Birthday", "Birth date"]);
                      const semesterCreditsColumn = findColumnByKeywords(["Tổng số TC trong học kỳ", "TC học kỳ", "Số TC học kỳ", "Tín chỉ học kỳ", "SoTCHK"]);
                      const semesterGpaColumn = findColumnByKeywords(["Điểm TB học kỳ", "GPA học kỳ", "ĐiểmTBHK", "DiemTBHK", "Điểm trung bình học kỳ"]);
                      const totalCreditsColumn = getColumnByType("credits");
                      const gpaColumn = getColumnByType("gpa");
                      
                      // Kiểm tra có dữ liệu hay không
                      if (!filePreview || filePreview.length === 0 || !warningColumn) {
                        return null;
                      }
                      
                      // Kiểm tra hàng đầu tiên có phải là metadata không
                      const isFirstRowMetadata = filePreview.length > 0 && 
                        (!filePreview[0]["STT"] && !filePreview[0][idColumn]);
                      
                      const dataRows = isFirstRowMetadata ? filePreview.slice(1) : filePreview;
                      
                      // Lọc sinh viên bị cảnh báo học tập
                      const warningStudents = dataRows.filter(row => {
                        if (!warningColumn || !row[warningColumn]) return false;
                        const value = String(row[warningColumn]).toLowerCase();
                        return value.includes("cảnh báo") || value.includes("canh bao");
                      });
                      
                      // Nếu không có sinh viên bị cảnh báo, không hiển thị bảng
                      if (warningStudents.length === 0) {
                        return null;
                      }
                      
                      // Danh sách các cột sẽ hiển thị
                      const columnsToShow = [
                        { id: "stt", label: "STT", getValue: (_: any, index: number) => index + 1 },
                        { id: "id", label: idColumn, getValue: (student: any) => student[idColumn] },
                        { id: "name", label: nameColumn, getValue: (student: any) => student[nameColumn] }
                      ];
                      
                      // Thêm các cột tùy chọn nếu có
                      if (birthDateColumn) {
                        columnsToShow.push({ 
                          id: "birthDate", 
                          label: birthDateColumn, 
                          getValue: (student: any) => student[birthDateColumn] 
                        });
                      }
                      
                      if (semesterCreditsColumn) {
                        columnsToShow.push({ 
                          id: "semesterCredits", 
                          label: semesterCreditsColumn, 
                          getValue: (student: any) => student[semesterCreditsColumn] 
                        });
                      }
                      
                      if (semesterGpaColumn) {
                        columnsToShow.push({ 
                          id: "semesterGpa", 
                          label: semesterGpaColumn, 
                          getValue: (student: any) => student[semesterGpaColumn] 
                        });
                      }
                      
                      if (totalCreditsColumn) {
                        columnsToShow.push({ 
                          id: "totalCredits", 
                          label: totalCreditsColumn, 
                          getValue: (student: any) => student[totalCreditsColumn] 
                        });
                      }
                      
                      if (gpaColumn) {
                        columnsToShow.push({ 
                          id: "gpa", 
                          label: gpaColumn, 
                          getValue: (student: any) => student[gpaColumn] 
                        });
                      }
                      
                      // Luôn hiển thị cột cảnh báo
                      columnsToShow.push({ 
                        id: "warning", 
                        label: warningColumn, 
                        getValue: (student: any) => student[warningColumn] 
                      });
                      
                      return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <h3 className="text-lg font-medium text-red-700">
                              Danh sách sinh viên bị cảnh báo học tập ({warningStudents.length})
                            </h3>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="min-w-full border">
                              <thead>
                                <tr className="bg-red-600 text-white">
                                  {columnsToShow.map(column => (
                                    <th key={column.id} className="py-2 px-3 border text-left text-sm whitespace-nowrap">
                                      {column.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {warningStudents.map((student, index) => (
                                  <tr key={`warning-${index}`} className="bg-white hover:bg-red-50">
                                    {columnsToShow.map(column => {
                                      let cellClass = "py-2 px-3 border text-sm";
                                      
                                      // Định dạng đặc biệt cho các cột
                                      if (column.id === "id" || column.id === "name") {
                                        cellClass += " font-medium";
                                      }
                                      
                                      if (column.id === "gpa") {
                                        const value = parseFloat(student[gpaColumn]);
                                        if (!isNaN(value) && value < 2.0) {
                                          cellClass += " text-red-600 font-medium";
                                        }
                                      }
                                      
                                      if (column.id === "warning") {
                                        cellClass += " text-red-600 font-medium";
                                      }
                                      
                                      return (
                                        <td key={`warning-${index}-${column.id}`} className={cellClass}>
                                          {column.getValue(student, index)}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* Bảng dữ liệu đầy đủ */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-3">
                        <FaTable className="text-indigo-600 mr-2" />
                        <h3 className="text-lg font-medium text-indigo-700">
                          Dữ liệu đầy đủ
                        </h3>
                      </div>
                      
                      <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full border">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-indigo-600 text-white">
                              {Object.keys(filePreview[0] || {}).map((key) => {
                                // Xác định cột quan trọng
                                const isIdColumn = key === getColumnByType("id") || key === "STT";
                                const isNameColumn = key === getColumnByType("name");
                                const isWarningColumn = key === getColumnByType("warning");
                                const isGpaColumn = key === getColumnByType("gpa") || key.includes("Điểm TB tích lũy");
                                const isImportantColumn = isIdColumn || isNameColumn || isWarningColumn || isGpaColumn;
                                
                                // Class cho header
                                let headerClass = "py-2 px-3 border text-left text-sm whitespace-nowrap";
                                if (isImportantColumn) {
                                  headerClass += " bg-indigo-700 font-bold";
                                }
                                if (isWarningColumn) {
                                  headerClass += " bg-red-600";
                                }
                                
                                return (
                                  <th key={key} className={headerClass}>
                                    {key}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {filePreview.map((row, rowIndex) => {
                              // Kiểm tra xem hàng đầu tiên có phải là metadata không
                              const isFirstRowMetadata = filePreview.length > 0 && rowIndex === 0 && 
                                (!filePreview[0]["STT"] && !filePreview[0][getColumnByType("id")]);
                              
                              // Kiểm tra nếu sinh viên bị cảnh báo học tập
                              const warningColumn = getColumnByType("warning");
                              const hasWarning = row[warningColumn] && 
                                (String(row[warningColumn]).toLowerCase().includes("cảnh báo") || 
                                 String(row[warningColumn]).toLowerCase().includes("canh bao"));
                              
                              // Thêm class đặc biệt cho hàng metadata và sinh viên bị cảnh báo
                              const rowClass = isFirstRowMetadata 
                                ? "bg-gray-200 font-semibold" 
                                : hasWarning
                                  ? "bg-red-50 hover:bg-red-100"
                                  : rowIndex % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-100";
                              
                              return (
                                <tr key={rowIndex} className={rowClass}>
                                  {Object.keys(filePreview[0] || {}).map((key) => {
                                    // Xác định cột quan trọng
                                    const isIdColumn = key === getColumnByType("id") || key === "STT";
                                    const isNameColumn = key === getColumnByType("name");
                                    const isWarningColumn = key === getColumnByType("warning");
                                    const isGpaColumn = key === getColumnByType("gpa") || key.includes("Điểm TB tích lũy");
                                    
                                    // Định dạng đặc biệt cho các cột
                                    let cellClass = "py-2 px-3 border text-sm";
                                    
                                    // Định dạng cho cột mã sinh viên và tên
                                    if (isIdColumn) {
                                      cellClass += " font-medium bg-gray-50";
                                    }
                                    if (isNameColumn) {
                                      cellClass += " font-medium";
                                    }
                                    
                                    // Định dạng đặc biệt cho cột cảnh báo học tập
                                    if (isWarningColumn && hasWarning) {
                                      cellClass += " text-red-600 font-medium bg-red-50";
                                    }
                                    
                                    // Định dạng cho điểm trung bình
                                    if (isGpaColumn) {
                                      const value = parseFloat(row[key]);
                                      if (!isNaN(value)) {
                                        if (value < 2.0) {
                                          cellClass += " text-red-600 font-medium";
                                        } else if (value >= 3.2) {
                                          cellClass += " text-green-600 font-medium";
                                        }
                                      }
                                    }
                                    
                                    return (
                                      <td key={`${rowIndex}-${key}`} className={cellClass}>
                                        {row[key] !== undefined ? row[key] : ""}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                    <p className="text-center text-gray-500 mb-2">Không có dữ liệu trong lớp này</p>
                    <p className="text-sm text-gray-400">File có thể không đúng định dạng hoặc không chứa dữ liệu</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FaFileImport className="text-4xl mb-2 text-gray-400" />
                <p>Chọn một file để xem dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal hiển thị kết quả gửi email cảnh báo học tập */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-indigo-800">Kết quả gửi cảnh báo học tập</h3>
              <button 
                onClick={() => setShowWarningModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <FaFileExcel className="text-green-600 mr-2" />
                <p className="font-medium">{warningModalResults.fileName}</p>
              </div>
              
              <div className="flex items-center mb-2">
                <FaGraduationCap className="text-blue-600 mr-2" />
                <p>Lớp: <span className="font-medium">{warningModalResults.sheet}</span></p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              {warningModalResults.result?.success ? (
                <div className="text-center">
                  {warningModalResults.result.data?.studentsWarned > 0 ? (
                    <div className="text-green-600 flex flex-col items-center">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-bold text-lg">Thành công</p>
                      <p className="mt-1">
                        Đã gửi email cảnh báo học tập cho {warningModalResults.result.data.studentsWarned} sinh viên
                      </p>
                    </div>
                  ) : (
                    <div className="text-blue-600 flex flex-col items-center">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-bold text-lg">Không có cảnh báo</p>
                      <p className="mt-1">Không tìm thấy sinh viên bị cảnh báo học tập trong lớp này</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-red-600 flex flex-col items-center">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-bold text-lg">Lỗi</p>
                  <p className="mt-1">{warningModalResults.result?.message || "Không thể gửi email cảnh báo học tập"}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowWarningModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ExcelFilesManager; 