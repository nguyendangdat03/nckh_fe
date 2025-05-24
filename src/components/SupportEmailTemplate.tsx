import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaSpinner, FaTimes, FaEdit, FaEye, FaCode, FaFont } from 'react-icons/fa';
import mailService from '../services/mailService';
import studentService, { Student } from '../services/studentService';
import EmailPreview from './EmailPreview';

interface SupportEmailTemplateProps {
  studentData: any;
  advisorInfo: any;
  onClose: () => void;
  onSent?: () => void;
}

const SupportEmailTemplate: React.FC<SupportEmailTemplateProps> = ({
  studentData,
  advisorInfo,
  onClose,
  onSent
}) => {
  const [sending, setSending] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [useHtmlTemplate, setUseHtmlTemplate] = useState(true);
  const [emailData, setEmailData] = useState({
    subject: 'Hỗ trợ học tập - Thông tin quan trọng',
    content: generateDefaultContent(),
    to: studentData.email || `${studentData["Mã SV"]?.toLowerCase()}@sv.hunre.edu.vn` || "",
    htmlContent: "",
  });

  // Lấy thông tin sinh viên từ API
  useEffect(() => {
    const fetchStudentInfo = async () => {
      const studentCode = studentData["Mã SV"];
      if (!studentCode) return;

      try {
        setLoadingStudent(true);
        const student = await studentService.getStudentByStudentCode(studentCode);
        
        if (student) {
          setStudentInfo(student);
          
          // Cập nhật email từ API
          setEmailData(prev => ({
            ...prev,
            to: student.email || prev.to
          }));
          
          // Tạo nội dung HTML
          generateHtmlContent(student);
        }
      } catch (error) {
        console.error("Không thể lấy thông tin sinh viên:", error);
      } finally {
        setLoadingStudent(false);
      }
    };

    fetchStudentInfo();
  }, [studentData]);

  function generateDefaultContent() {
    return `
Kính gửi ${studentData["Họ và tên"] || "bạn sinh viên"},

Tôi là ${advisorInfo.username || "giảng viên"}, cố vấn học tập của bạn. Qua báo cáo học tập gần đây, tôi nhận thấy bạn đang gặp một số thách thức trong việc học và đang ở tình trạng "${studentData["MỨC CẢNH BÁO HỌC TẬP ĐÃ NHẬN KỲ TRƯỚC"] || "cảnh báo học tập"}".

Thông tin học tập của bạn:
- Mã số sinh viên: ${studentData["Mã SV"] || ""}
- Điểm trung bình tích lũy: ${studentData["Điểm TB tích lũy"] || ""}
- Số tín chỉ đã tích lũy: ${studentData["Tổng số TC tích lũy"] || ""}

Tôi muốn nhắn với bạn rằng, đây là cơ hội để cùng nhau tìm ra các giải pháp phù hợp giúp bạn cải thiện kết quả học tập. Tôi sẵn sàng hỗ trợ và tư vấn cho bạn trong thời gian tới.

Lịch gặp mặt tư vấn:
- Thứ 3 hàng tuần: 14:00 - 16:00 tại Phòng B305
- Thứ 5 hàng tuần: 9:00 - 11:00 tại Phòng B305

Bạn cũng có thể liên hệ với tôi qua:
- Email: ${advisorInfo.email || ""}
- Số điện thoại: ${advisorInfo.phone_number || ""}

Một số nguồn tài nguyên hỗ trợ:
1. Trung tâm hỗ trợ học tập: https://ttht.hunre.edu.vn
2. Thư viện tài liệu học tập: https://lib.hunre.edu.vn

Tôi đề nghị bạn sắp xếp thời gian để chúng ta có thể gặp nhau trong tuần này hoặc tuần tới để thảo luận về kế hoạch học tập phù hợp cho bạn.

Trân trọng,
${advisorInfo.username || "Giảng viên"}
Cố vấn học tập
    `;
  }

  // Tạo nội dung HTML email
  const generateHtmlContent = (student?: Student) => {
    const data = {
      student_name: student?.username || studentData["Họ và tên"] || "bạn sinh viên",
      student_code: student?.student_code || studentData["Mã SV"] || "",
      warning_level: studentData["MỨC CẢNH BÁO HỌC TẬP ĐÃ NHẬN KỲ TRƯỚC"] || "cảnh báo học tập",
      gpa: studentData["Điểm TB tích lũy"] || "",
      credits: studentData["Tổng số TC tích lũy"] || "",
      advisor_name: advisorInfo.username || "giảng viên",
      advisor_email: advisorInfo.email || "",
      advisor_phone: advisorInfo.phone_number || "",
      semester: "Học kỳ 1 năm học 2023-2024",
      meeting_schedule: [
        { date: "Thứ 3", time: "14:00 - 16:00", location: "Phòng B305" },
        { date: "Thứ 5", time: "9:00 - 11:00", location: "Phòng B305" }
      ]
    };

    const htmlContent = mailService.generateSupportEmailHtml(data);
    
    setEmailData(prev => ({
      ...prev,
      htmlContent: htmlContent
    }));
  };

  const handleSend = async () => {
    try {
      setSending(true);

      // Nếu không có email, thử lấy lại thông tin sinh viên
      if (!emailData.to && studentData["Mã SV"] && !studentInfo) {
        try {
          const student = await studentService.getStudentByStudentCode(studentData["Mã SV"]);
          if (student) {
            setStudentInfo(student);
            setEmailData(prev => ({
              ...prev,
              to: student.email
            }));
          }
        } catch (error) {
          console.error("Không thể lấy thông tin sinh viên trước khi gửi:", error);
        }
      }

      // Kiểm tra xem có email người nhận không
      if (!emailData.to) {
        alert("Không có địa chỉ email người nhận. Vui lòng nhập email trước khi gửi.");
        setSending(false);
        return;
      }

      // Chuẩn bị dữ liệu email
      const emailDataToSend = {
        to: emailData.to,
        subject: emailData.subject,
        template: useHtmlTemplate ? "custom_html" : "custom",
        context: {
          content: useHtmlTemplate ? emailData.htmlContent : emailData.content,
          student_name: studentInfo?.username || studentData["Họ và tên"] || "",
          student_code: studentInfo?.student_code || studentData["Mã SV"] || "",
          advisor_name: advisorInfo.username || ""
        },
        isHtml: useHtmlTemplate
      };

      // Gọi API gửi email
      await mailService.sendEmail(emailDataToSend);

      // Thông báo thành công
      alert(`Đã gửi email hỗ trợ thành công tới ${emailData.to}!`);
      
      // Gọi callback nếu có
      if (onSent) onSent();
      
      // Đóng modal
      onClose();
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
      alert("Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Gửi email hỗ trợ sinh viên</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
            disabled={sending}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loadingStudent && (
            <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded flex items-center">
              <FaSpinner className="animate-spin mr-2" /> Đang lấy thông tin sinh viên...
            </div>
          )}
          
          {studentInfo && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-1">Đã tìm thấy thông tin sinh viên</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Họ tên:</span> {studentInfo.username}
                </div>
                <div>
                  <span className="text-gray-600">Mã SV:</span> {studentInfo.student_code}
                </div>
                <div>
                  <span className="text-gray-600">Email:</span> {studentInfo.email}
                </div>
                <div>
                  <span className="text-gray-600">SĐT:</span> {studentInfo.phone_number}
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Định dạng email</label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setUseHtmlTemplate(true)}
                className={`px-3 py-2 flex items-center rounded-md ${
                  useHtmlTemplate 
                    ? "bg-indigo-100 text-indigo-800 border border-indigo-300" 
                    : "bg-gray-100 text-gray-600 border border-gray-300"
                }`}
              >
                <FaCode className="mr-2" /> HTML (Đẹp)
              </button>
              <button
                onClick={() => setUseHtmlTemplate(false)}
                className={`px-3 py-2 flex items-center rounded-md ${
                  !useHtmlTemplate 
                    ? "bg-indigo-100 text-indigo-800 border border-indigo-300" 
                    : "bg-gray-100 text-gray-600 border border-gray-300"
                }`}
              >
                <FaFont className="mr-2" /> Văn bản thuần
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Người nhận</label>
            <div className="flex items-center">
              <input
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                placeholder="Email của sinh viên"
                disabled={!editMode || sending}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Tiêu đề</label>
            <div className="flex items-center">
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                disabled={!editMode || sending}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-bold">Nội dung</label>
              <div className="flex items-center space-x-2">
                {!useHtmlTemplate && (
                  <button
                    onClick={() => {
                      setEditMode(!editMode);
                      if (previewMode && !editMode) {
                        setPreviewMode(false);
                      }
                    }}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
                    disabled={sending}
                  >
                    <FaEdit className="mr-1" /> {editMode ? 'Tắt chỉnh sửa' : 'Chỉnh sửa'}
                  </button>
                )}
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-green-600 hover:text-green-800 flex items-center text-sm"
                  disabled={sending}
                >
                  <FaEye className="mr-1" /> {previewMode ? 'Hiển thị đơn giản' : 'Xem trước'}
                </button>
              </div>
            </div>
            
            {useHtmlTemplate ? (
              previewMode ? (
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <EmailPreview
                    content=""
                    subject={emailData.subject}
                    studentName={studentInfo?.username || studentData["Họ và tên"] || ""}
                    studentCode={studentInfo?.student_code || studentData["Mã SV"] || ""}
                    advisorName={advisorInfo.username || ""}
                    isHtml={true}
                    htmlContent={emailData.htmlContent}
                  />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-md p-3 min-h-[300px] bg-white">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FaCode className="text-4xl text-indigo-400 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-indigo-700">Email HTML đẹp</h3>
                      <p className="text-gray-500 mt-1 max-w-md">
                        Email được định dạng với HTML và CSS để hiển thị đẹp mắt khi nhận được.
                      </p>
                      <button
                        onClick={() => setPreviewMode(true)}
                        className="mt-3 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                      >
                        Xem trước
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : editMode ? (
              <div className="border border-gray-300 rounded-md p-3 min-h-[300px] bg-white">
                <textarea
                  value={emailData.content}
                  onChange={(e) => setEmailData({...emailData, content: e.target.value})}
                  className="w-full h-[350px] border-0 focus:outline-none resize-none"
                  disabled={sending}
                ></textarea>
              </div>
            ) : previewMode ? (
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <EmailPreview
                  content={emailData.content}
                  subject={emailData.subject}
                  studentName={studentInfo?.username || studentData["Họ và tên"] || ""}
                  studentCode={studentInfo?.student_code || studentData["Mã SV"] || ""}
                  advisorName={advisorInfo.username || ""}
                />
              </div>
            ) : (
              <div className="border border-gray-300 rounded-md p-3 min-h-[300px] bg-white">
                <div className="whitespace-pre-wrap h-[350px] overflow-y-auto">
                  {emailData.content}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-100 px-6 py-4 flex justify-between">
          <div className="text-sm text-gray-600">
            Gửi đến sinh viên: <span className="font-semibold">{studentInfo?.username || studentData["Họ và tên"] || ""}</span> ({studentInfo?.student_code || studentData["Mã SV"] || ""})
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-200 transition"
              disabled={sending}
            >
              Hủy
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center"
              disabled={sending || loadingStudent}
            >
              {sending ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" />
                  Gửi email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportEmailTemplate;