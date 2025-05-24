import React, { useState } from 'react';
import { FaPaperPlane, FaSpinner, FaTimes, FaEye, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import mailService from '../services/mailService';

interface AdminEmailTemplateProps {
  onClose: () => void;
  onSent?: () => void;
  recipientData?: {
    name: string;
    email: string;
    role?: string;
  };
}

const AdminEmailTemplate: React.FC<AdminEmailTemplateProps> = ({
  onClose,
  onSent,
  recipientData
}) => {
  const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const [sending, setSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editMode, setEditMode] = useState(true);

  const [emailData, setEmailData] = useState({
    to: recipientData?.email || '',
    subject: 'Thông báo từ Phòng Đào tạo',
    notificationType: 'Thông báo chung',
    title: 'Thông báo học tập',
    content: '',
    actionRequired: '',
    deadline: '',
    htmlContent: '',
    recipientName: recipientData?.name || '',
    recipientRole: recipientData?.role || ''
  });

  const [contactInfo, setContactInfo] = useState({
    name: adminInfo?.username || 'Phòng Đào tạo',
    position: adminInfo?.role === 'admin' ? 'Quản trị viên' : 'Phòng Đào tạo',
    email: adminInfo?.email || 'daotao@hunre.edu.vn',
    phone: adminInfo?.phone_number || '(+84) 24 3837 6741'
  });

  const [additionalLinks, setAdditionalLinks] = useState<{
    title: string;
    url: string;
    description: string;
  }[]>([]);

  // Tạo nội dung HTML email
  const generateHtmlContent = () => {
    const data = {
      recipient_name: emailData.recipientName,
      recipient_role: emailData.recipientRole,
      notification_type: emailData.notificationType,
      title: emailData.title,
      content: emailData.content,
      action_required: emailData.actionRequired || undefined,
      deadline: emailData.deadline || undefined,
      contact_info: contactInfo,
      additional_links: additionalLinks.length > 0 ? additionalLinks : undefined
    };

    const htmlContent = mailService.generateAdminEmailHtml(data);
    
    setEmailData(prev => ({
      ...prev,
      htmlContent: htmlContent
    }));

    return htmlContent;
  };

  const addNewLink = () => {
    setAdditionalLinks([...additionalLinks, { title: '', url: '', description: '' }]);
  };

  const removeLink = (index: number) => {
    setAdditionalLinks(additionalLinks.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: 'title' | 'url' | 'description', value: string) => {
    const newLinks = [...additionalLinks];
    newLinks[index][field] = value;
    setAdditionalLinks(newLinks);
  };

  const handlePreview = () => {
    generateHtmlContent();
    setPreviewMode(true);
    setEditMode(false);
  };

  const handleEditMode = () => {
    setPreviewMode(false);
    setEditMode(true);
  };

  const handleSend = async () => {
    if (!emailData.to) {
      alert('Vui lòng nhập địa chỉ email người nhận.');
      return;
    }

    try {
      setSending(true);

      // Tạo nội dung HTML nếu chưa có
      if (!emailData.htmlContent) {
        generateHtmlContent();
      }

      // Chuẩn bị dữ liệu email
      const emailDataToSend = {
        to: emailData.to,
        subject: emailData.subject,
        template: 'custom_html',
        context: {
          content: emailData.htmlContent || generateHtmlContent(),
          recipient_name: emailData.recipientName,
          notification_type: emailData.notificationType,
          title: emailData.title
        },
        isHtml: true
      };

      // Gọi API gửi email
      await mailService.sendEmail(emailDataToSend);

      // Thông báo thành công
      alert(`Đã gửi email thành công tới ${emailData.to}!`);
      
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Gửi thông báo chính thức</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
            disabled={sending}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={handleEditMode}
              className={`px-4 py-2 flex items-center ${editMode ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-600'} rounded-md`}
            >
              <FaEdit className="mr-2" /> Chỉnh sửa
            </button>
            <button
              onClick={handlePreview}
              className={`px-4 py-2 flex items-center ${previewMode ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600'} rounded-md`}
            >
              <FaEye className="mr-2" /> Xem trước
            </button>
          </div>

          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Người nhận</label>
                  <input
                    type="email"
                    value={emailData.to}
                    onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    placeholder="Email người nhận"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Tên người nhận</label>
                  <input
                    type="text"
                    value={emailData.recipientName}
                    onChange={(e) => setEmailData({...emailData, recipientName: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    placeholder="Tên người nhận"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Vai trò người nhận</label>
                  <input
                    type="text"
                    value={emailData.recipientRole}
                    onChange={(e) => setEmailData({...emailData, recipientRole: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    placeholder="Sinh viên / Giảng viên / Cố vấn học tập"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Tiêu đề email</label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    placeholder="Tiêu đề email"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Loại thông báo</label>
                  <select
                    value={emailData.notificationType}
                    onChange={(e) => setEmailData({...emailData, notificationType: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  >
                    <option value="Thông báo chung">Thông báo chung</option>
                    <option value="Học tập">Học tập</option>
                    <option value="Lịch thi">Lịch thi</option>
                    <option value="Học phí">Học phí</option>
                    <option value="Khẩn">Khẩn</option>
                    <option value="Quan trọng">Quan trọng</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Tiêu đề thông báo</label>
                  <input
                    type="text"
                    value={emailData.title}
                    onChange={(e) => setEmailData({...emailData, title: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    placeholder="Tiêu đề hiển thị trong email"
                  />
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Nội dung</label>
                  <textarea
                    value={emailData.content}
                    onChange={(e) => setEmailData({...emailData, content: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full h-32"
                    placeholder="Nội dung thông báo"
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Yêu cầu hành động (nếu có)</label>
                  <textarea
                    value={emailData.actionRequired}
                    onChange={(e) => setEmailData({...emailData, actionRequired: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full h-20"
                    placeholder="Mô tả hành động cần thực hiện"
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Thời hạn (nếu có)</label>
                  <input
                    type="text"
                    value={emailData.deadline}
                    onChange={(e) => setEmailData({...emailData, deadline: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    placeholder="VD: 17h00 ngày 15/12/2023"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Thông tin liên hệ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Tên người liên hệ"
                    />
                    <input
                      type="text"
                      value={contactInfo.position}
                      onChange={(e) => setContactInfo({...contactInfo, position: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Chức vụ"
                    />
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Email liên hệ"
                    />
                    <input
                      type="text"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Số điện thoại"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {editMode && (
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-700">Liên kết bổ sung</h3>
                <button
                  onClick={addNewLink}
                  className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-700"
                >
                  <FaPlus size={12} />
                </button>
              </div>
              
              {additionalLinks.map((link, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700">Liên kết #{index + 1}</h4>
                    <button
                      onClick={() => removeLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => updateLink(index, 'title', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Tiêu đề liên kết"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2"
                      placeholder="URL (https://...)"
                    />
                  </div>
                  
                  <textarea
                    value={link.description}
                    onChange={(e) => updateLink(index, 'description', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    placeholder="Mô tả ngắn (tùy chọn)"
                    rows={2}
                  ></textarea>
                </div>
              ))}
              
              {additionalLinks.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  Không có liên kết nào. Click vào nút + để thêm liên kết.
                </div>
              )}
            </div>
          )}

          {previewMode && (
            <div className="border rounded-md overflow-hidden">
              <div dangerouslySetInnerHTML={{ __html: emailData.htmlContent || generateHtmlContent() }} />
            </div>
          )}
        </div>

        <div className="bg-gray-100 px-6 py-4 flex justify-end">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
              disabled={sending}
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

export default AdminEmailTemplate; 