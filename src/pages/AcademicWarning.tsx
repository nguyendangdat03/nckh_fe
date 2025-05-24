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
  const [sheetData, setSheetData] = useState<any[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [filterWarningOnly, setFilterWarningOnly] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

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
      setSheetData(null);
      
      // Lấy thông tin về các sheets (lớp) trong file
      const excelData = await excelService.getExcelData(fileName);
      setAvailableSheets(excelData.sheets);
      
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
      
      const data = await excelService.getSheetData(fileName, sheetName);
      setSheetData(data);
      
      setError(null);
    } catch (err) {
      console.error(`Error loading sheet data for ${sheetName}:`, err);
      setError(`Không thể tải dữ liệu lớp ${sheetName}. Vui lòng thử lại sau.`);
      setSheetData(null);
    } finally {
      setLoading(false);
    }
  };

  // Lọc và tìm kiếm dữ liệu
  const getFilteredData = () => {
    if (!sheetData) return [];
    
    // Bỏ qua hàng đầu tiên nếu là hàng tiêu đề môn học
    const dataToSearch = sheetData[0] && !sheetData[0]["STT"] ? sheetData.slice(1) : sheetData;
    
    // Nếu là sinh viên, chỉ hiển thị dữ liệu của sinh viên đó
    if (userInfo?.role === 'student') {
      return getStudentData() ? [getStudentData()] : [];
    }
    
    // Lấy các cột quan trọng
    const idColumn = getColumnByType("id");
    const nameColumn = getColumnByType("name");
    const warningColumn = getColumnByType("warning");
    
    return dataToSearch.filter(row => {
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
  };

  // Tìm kiếm dữ liệu của sinh viên hiện tại
  const getStudentData = () => {
    if (!sheetData || !userInfo || userInfo.role !== 'student') return null;
    
    // Bỏ qua hàng đầu tiên nếu là hàng tiêu đề môn học
    const dataToSearch = sheetData[0] && !sheetData[0]["STT"] ? sheetData.slice(1) : sheetData;
    
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
    if (!sheetData || sheetData.length === 0) return "";
    
    // Tìm hàng dữ liệu đầu tiên (bỏ qua hàng tiêu đề môn học nếu có)
    const dataRow = sheetData[0] && !sheetData[0]["STT"] ? sheetData[1] : sheetData[0];
    if (!dataRow) return "";
    
    const columnMappings: {[key: string]: string[]} = {
      id: ["Mã SV", "MaSV", "MSSV"],
      name: ["Họ và tên", "HoTen"],
      warning: ["MỨC CẢNH BÁO HỌC TẬP ĐÃ NHẬN KỲ TRƯỚC", "Cảnh báo học tập", "CanhBao"],
      gpa: ["Điểm TB tích lũy", "DiemTBTichLuy"],
      credits: ["Tổng số TC tích lũy", "TongTC"]
    };
    
    // Tìm cột phù hợp
    const allColumns = Object.keys(dataRow);
    const possibleColumns = columnMappings[type];
    
    for (const col of possibleColumns) {
      if (allColumns.includes(col)) {
        return col;
      }
    }
    
    return possibleColumns[0]; // Trả về cột mặc định nếu không tìm thấy
  };

  // Lấy danh sách các cột cần hiển thị
  const getDisplayColumns = () => {
    if (!sheetData || sheetData.length === 0) return [];

    // Bỏ qua hàng đầu tiên nếu là hàng tiêu đề môn học
    const dataRow = sheetData[0] && !sheetData[0]["STT"] ? sheetData[1] : sheetData[0];
    if (!dataRow) return [];

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
    const allColumns = Object.keys(dataRow);
    
    // Lọc để lấy các cột quan trọng có trong dữ liệu
    return importantColumns.filter(col => allColumns.includes(col));
  };

  const filteredData = getFilteredData();
  const displayColumns = getDisplayColumns();
  const studentData = getStudentData();

  // Đếm số sinh viên bị cảnh báo
  const countWarningStudents = () => {
    if (!sheetData) return 0;
    
    // Bỏ qua hàng đầu tiên nếu là hàng tiêu đề môn học
    const dataToCount = sheetData[0] && !sheetData[0]["STT"] ? sheetData.slice(1) : sheetData;
    
    const warningColumn = getColumnByType("warning");
    return dataToCount.filter(row => {
      // Bỏ qua các hàng không có dữ liệu hoặc hàng tiêu đề
      if (!row || !row[getColumnByType("id")]) return false;
      
      const warningStatus = row[warningColumn]?.toString() || "";
      return warningStatus.toLowerCase().includes("cảnh báo");
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
    return warningStatus.includes("cảnh báo");
  };
  
  // Xử lý gửi email cho sinh viên
  const handleSendSupportEmail = (student: any) => {
    setSelectedStudent(student);
    setShowEmailModal(true);
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
                    onClick={() => handleFileSelect(file.name)}
                    className={`p-3 border-b cursor-pointer flex items-center ${
                      selectedFile === file.name
                        ? "bg-indigo-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <FaFileExcel className="text-green-600 mr-2" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {typeof file.size === 'number' 
                          ? `${(file.size / 1024).toFixed(2)} KB` 
                          : file.size}
                      </p>
                    </div>
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
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayColumns.map((columnKey) => (
                                  <div key={columnKey} className="flex flex-col">
                                    <span className="text-sm text-gray-600">{columnKey}</span>
                                    <span className={`font-medium ${
                                      columnKey === getColumnByType("warning") && 
                                      studentData[columnKey]?.toString().includes("Cảnh báo") 
                                        ? "text-red-600" 
                                        : ""
                                    }`}>
                                      {studentData[columnKey] !== undefined ? studentData[columnKey] : "-"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Hiển thị cảnh báo nếu có */}
                            {studentData[getColumnByType("warning")] && 
                            studentData[getColumnByType("warning")].toString().includes("Cảnh báo") && (
                              <div className="p-4 mb-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                                <div className="flex items-center">
                                  <FaExclamationTriangle className="text-yellow-600 mr-2" />
                                  <h3 className="text-lg font-medium text-yellow-800">Cảnh báo học tập</h3>
                                </div>
                                <p className="mt-2 text-yellow-700">
                                  Bạn đang trong tình trạng {studentData[getColumnByType("warning")]}. 
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
                        {filteredData.length > 0 ? (
                          <div className="bg-white rounded-lg shadow-md p-5 overflow-auto mb-5">
                            <table className="min-w-full bg-white">
                              <thead>
                                <tr className="bg-indigo-600 text-white">
                                  {displayColumns.map((column) => (
                                    <th key={column} className="py-3 px-4 text-left">
                                      {column}
                                    </th>
                                  ))}
                                  {userInfo?.role === "advisor" && (
                                    <th className="py-3 px-4 text-right">Hành động</th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {filteredData.map((row, index) => (
                                  <tr
                                    key={index}
                                    className={`${
                                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                    } border-b hover:bg-gray-100 ${
                                      hasWarningStatus(row) ? "bg-red-50 hover:bg-red-100" : ""
                                    }`}
                                  >
                                    {displayColumns.map((column) => (
                                      <td
                                        key={column}
                                        className={`py-3 px-4 ${
                                          column === getColumnByType("warning") && row[column]?.toString().toLowerCase().includes("cảnh báo")
                                            ? "text-red-600 font-medium"
                                            : ""
                                        }`}
                                      >
                                        {row[column] !== undefined ? row[column] : ""}
                                      </td>
                                    ))}
                                    {userInfo?.role === "advisor" && (
                                      <td className="py-3 px-4 text-right">
                                        {hasWarningStatus(row) && (
                                          <button
                                            onClick={() => handleSendSupportEmail(row)}
                                            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded inline-flex items-center text-sm"
                                            title="Gửi email hỗ trợ"
                                          >
                                            <FaEnvelope className="mr-1" /> Hỗ trợ
                                          </button>
                                        )}
                                      </td>
                                    )}
                                  </tr>
                                ))}
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
      </MainLayout>
    );
  }
};

export default AcademicWarning;
