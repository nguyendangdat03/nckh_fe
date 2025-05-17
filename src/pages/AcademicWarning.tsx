import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import excelService, { ExcelFile, ExcelData } from "../services/excelService";
import {
  FaFileExcel,
  FaSpinner,
  FaSearch,
  FaExclamationTriangle,
} from "react-icons/fa";

// Định nghĩa kiểu dữ liệu học sinh
interface StudentData {
  STT?: number;
  "Mã SV"?: string;
  "Họ và tên"?: string;
  "Ngày sinh"?: string;
  "Điểm TB học kỳ"?: number;
  "Tổng số tín chỉ tích lũy"?: number;
  "Điểm TB tích lũy"?: number;
  "MỨC CẢNH BÁO HỌC TẬP"?: string;
  [key: string]: any; // Cho phép các trường khác
}

const AcademicWarning: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<any[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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

  // Lấy dữ liệu file Excel khi chọn file
  useEffect(() => {
    const fetchExcelData = async () => {
      if (!selectedFile) return;

      try {
        setLoading(true);
        const data = await excelService.getExcelData(selectedFile);
        setExcelData(data);

        // Tự động chọn sheet đầu tiên
        if (data.sheets && data.sheets.length > 0) {
          setSelectedSheet(data.sheets[0]);
        } else {
          setSelectedSheet(null);
          setSheetData(null);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching excel data:", err);
        setError("Không thể tải dữ liệu file Excel. Vui lòng thử lại sau.");
        setExcelData(null);
        setSelectedSheet(null);
        setSheetData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchExcelData();
  }, [selectedFile]);

  // Lấy dữ liệu của sheet khi chọn sheet
  useEffect(() => {
    const fetchSheetData = async () => {
      if (!selectedFile || !selectedSheet) return;

      try {
        setLoading(true);
        const data = await excelService.getSheetData(
          selectedFile,
          selectedSheet
        );

        // Lọc bỏ các hàng không phải dữ liệu sinh viên (tiêu đề, tổng hợp, etc.)
        const studentData = data.filter((row) => {
          // Kiểm tra xem có phải hàng dữ liệu sinh viên không
          return row["__EMPTY"] && /^\d{8,}$/.test(row["__EMPTY"].toString());
        });

        setSheetData(studentData);
        setError(null);
      } catch (err) {
        console.error("Error fetching sheet data:", err);
        setError(
          `Không thể tải dữ liệu sheet ${selectedSheet}. Vui lòng thử lại sau.`
        );
        setSheetData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSheetData();
  }, [selectedFile, selectedSheet]);

  // Xử lý chọn file
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    setSelectedSheet(null);
    setSheetData(null);
  };

  // Xử lý chọn sheet
  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheet(sheetName);
  };

  // Tìm kiếm theo mã SV hoặc họ tên
  const filteredData = sheetData
    ? sheetData.filter((row) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();

        // Tìm trong mã SV
        if (
          row["__EMPTY"] &&
          row["__EMPTY"].toString().toLowerCase().includes(searchLower)
        ) {
          return true;
        }

        // Tìm trong họ tên
        if (
          row["__EMPTY_1"] &&
          row["__EMPTY_1"].toString().toLowerCase().includes(searchLower)
        ) {
          return true;
        }

        return false;
      })
    : [];

  // Lấy danh sách các cột cần hiển thị
  const getTableColumns = () => {
    if (!sheetData || sheetData.length === 0) return [];

    const firstRow = sheetData[0];
    const columnMap: { [key: string]: string } = {
      "BỘ TÀI NGUYÊN VÀ MÔI TRƯỜNG": "STT",
      __EMPTY: "Mã SV",
      __EMPTY_1: "Họ và tên",
      __EMPTY_3: "Ngày sinh",
      __EMPTY_13: "Điểm TB học kỳ",
      __EMPTY_14: "Tổng số TC tích lũy",
      __EMPTY_15: "Điểm TB tích lũy",
      __EMPTY_17: "Cảnh báo học tập",
    };

    return Object.keys(columnMap).filter((key) => key in firstRow);
  };

  // Format tên cột để hiển thị người dùng dễ đọc
  const formatColumnName = (columnKey: string): string => {
    const columnNames: { [key: string]: string } = {
      "BỘ TÀI NGUYÊN VÀ MÔI TRƯỜNG": "STT",
      __EMPTY: "Mã SV",
      __EMPTY_1: "Họ và tên",
      __EMPTY_3: "Ngày sinh",
      __EMPTY_13: "Điểm TB học kỳ",
      __EMPTY_14: "Tổng số TC tích lũy",
      __EMPTY_15: "Điểm TB tích lũy",
      __EMPTY_17: "Cảnh báo học tập",
    };

    return columnNames[columnKey] || columnKey;
  };

  return (
    <MainLayout>
      <div className="w-full h-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-indigo-900 flex items-center">
            <FaExclamationTriangle className="mr-2 text-yellow-500" />
            Cảnh báo học tập
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
            <h2 className="text-lg font-semibold mb-4">Chọn File</h2>
            {loading && !excelFiles.length ? (
              <div className="flex justify-center items-center h-32">
                <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[400px]">
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
                        {file.size} •{" "}
                        {new Date(file.uploadDate).toLocaleDateString()}
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
            {!selectedFile ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FaFileExcel className="text-5xl mb-4 text-gray-400" />
                <p>Vui lòng chọn file để xem dữ liệu</p>
              </div>
            ) : (
              <>
                {/* Tabs cho các sheets */}
                {excelData && (
                  <div className="flex border-b mb-4 overflow-x-auto whitespace-nowrap">
                    {excelData.sheets.map((sheet, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 font-medium ${
                          selectedSheet === sheet
                            ? "border-b-2 border-indigo-500 text-indigo-500"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => handleSheetSelect(sheet)}
                      >
                        {sheet}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tìm kiếm */}
                <div className="mb-4 relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã SV, họ tên..."
                    className="w-full px-10 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>

                {/* Bảng dữ liệu */}
                {loading && !sheetData ? (
                  <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
                  </div>
                ) : sheetData && sheetData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {getTableColumns().map((key, index) => (
                            <th
                              key={index}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {formatColumnName(key)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            {getTableColumns().map((key, cellIndex) => (
                              <td
                                key={cellIndex}
                                className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                                  key === "__EMPTY_17" && row[key]
                                    ? "font-bold text-red-600"
                                    : ""
                                }`}
                              >
                                {row[key] !== null && row[key] !== undefined
                                  ? String(row[key])
                                  : ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredData.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        Không tìm thấy dữ liệu phù hợp với từ khóa "{searchTerm}
                        "
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <p>Không có dữ liệu</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AcademicWarning;
