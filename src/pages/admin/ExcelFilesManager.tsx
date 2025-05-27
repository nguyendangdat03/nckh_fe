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
  const [filePreview, setFilePreview] = useState<any[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  
  // Form state cho upload file
  const [uploadForm, setUploadForm] = useState({
    semester: 1,
    year: new Date().getFullYear(),
    description: ""
  });
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [selectedFileToupload, setSelectedFileToUpload] = useState<File | null>(null);

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
      
      const formData = new FormData();
      formData.append('file', selectedFileToupload);
      formData.append('semester', uploadForm.semester.toString());
      formData.append('year', uploadForm.year.toString());
      
      if (uploadForm.description) {
        formData.append('description', uploadForm.description);
      }
      
      await excelService.uploadExcelFileWithParams(formData);
      
      // Refresh danh sách file sau khi upload
      await fetchExcelFiles();
      
      setSuccessMessage(`File ${selectedFileToupload.name} đã được tải lên thành công`);
      setShowUploadForm(false);
      setSelectedFileToUpload(null);
      setUploadForm({
        semester: 1,
        year: new Date().getFullYear(),
        description: ""
      });
      
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
        setFilePreview(null);
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
      setFilePreview(null);
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
      
      const data = await excelService.getSheetData(fileName, sheetName);
      setFilePreview(Array.isArray(data.data) ? data.data : []);
      
      setError(null);
    } catch (err) {
      console.error(`Error loading sheet data for ${sheetName}:`, err);
      setError(`Không thể tải dữ liệu lớp ${sheetName}. Vui lòng thử lại sau.`);
      setFilePreview(null);
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

  // Tìm file đang được chọn trong danh sách file để hiển thị thông tin học kỳ
  const getSelectedFileInfo = () => {
    return files.find(file => file.name === selectedFile);
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
                  value={uploadForm.description}
                  onChange={handleUploadFormChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                  rows={3}
                  placeholder="Nhập mô tả về file Excel này (ví dụ: Dữ liệu điểm lớp CNTT K62)"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setSelectedFileToUpload(null);
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
                </div>
              )}
            </div>
            
            {previewLoading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
              </div>
            ) : selectedFile && selectedSheet && filePreview ? (
              <div className="overflow-x-auto">
                {filePreview.length > 0 && Object.keys(filePreview[0] || {}).length > 0 ? (
                  <>
                    {/* Thông tin file */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <FaFileExcel className="text-green-600 mr-2" />
                        <h3 className="text-lg font-medium text-blue-800">
                          {getSelectedFileInfo()?.original_name || selectedFile}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Thông tin học kỳ */}
                        <div className="flex items-start">
                          <FaCalendarAlt className="text-blue-600 mr-2 mt-1" />
                          <div>
                            <p className="font-medium">Học kỳ:</p>
                            <p>{getSelectedFileInfo()?.semester || "-"}/{getSelectedFileInfo()?.year || "-"}</p>
                          </div>
                        </div>
                        
                        {/* Mô tả */}
                        {getSelectedFileInfo()?.description && (
                          <div className="flex items-start">
                            <FaInfoCircle className="text-blue-600 mr-2 mt-1" />
                            <div>
                              <p className="font-medium">Mô tả:</p>
                              <p>{getSelectedFileInfo()?.description}</p>
                            </div>
                          </div>
                        )}
                        
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
                            <p>{filePreview.length - (filePreview.length > 1 && filePreview[0]["STT"] === undefined ? 1 : 0)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bảng dữ liệu */}
                    <table className="min-w-full border">
                      <thead>
                        <tr className="bg-gray-100">
                          {Object.keys(filePreview[0]).map((key) => (
                            <th key={key} className="py-2 px-3 border text-left text-sm">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filePreview.map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : ""}>
                            {Object.keys(filePreview[0]).map((key) => (
                              <td key={`${rowIndex}-${key}`} className="py-2 px-3 border text-sm">
                                {row[key] !== undefined ? row[key] : ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className="text-center text-gray-500">Không có dữ liệu trong lớp này</p>
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
    </AdminLayout>
  );
};

export default ExcelFilesManager; 