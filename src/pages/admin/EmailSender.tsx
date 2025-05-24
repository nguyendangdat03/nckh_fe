import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import userService, { User } from "../../services/userService";
import mailService, { EmailTemplate, EmailData } from "../../services/mailService";
import {
  FaEnvelope,
  FaUsers,
  FaSpinner,
  FaSearch,
  FaPaperPlane,
  FaCheck,
  FaExclamationTriangle,
  FaUserGraduate,
  FaUserTie,
  FaFilter,
  FaTrash,
} from "react-icons/fa";

const EmailSender: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [emailData, setEmailData] = useState<EmailData>({
    to: "",
    subject: "",
    template: "",
    context: {},
  });
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sending, setSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách người dùng và mẫu email
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedUsers, fetchedTemplates] = await Promise.all([
          userService.getAllUsers(),
          mailService.getEmailTemplates(),
        ]);
        setUsers(fetchedUsers);
        setTemplates(fetchedTemplates);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cập nhật dữ liệu email khi chọn template
  useEffect(() => {
    if (selectedTemplate) {
      const templateContent = mailService.getTemplateContent(selectedTemplate);
      setEmailData((prev) => ({
        ...prev,
        template: selectedTemplate,
        subject: templateContent.subject,
        context: templateContent.context,
      }));
    }
  }, [selectedTemplate]);

  // Xử lý chọn người dùng
  const handleSelectUser = (user: User) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Xử lý chọn tất cả người dùng theo bộ lọc
  const handleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    
    // Nếu đã chọn tất cả, bỏ chọn tất cả
    if (filteredUsers.every(user => selectedUsers.some(u => u.id === user.id))) {
      setSelectedUsers(selectedUsers.filter(
        user => !filteredUsers.some(u => u.id === user.id)
      ));
    } else {
      // Thêm những người dùng chưa được chọn
      const newSelectedUsers = [...selectedUsers];
      filteredUsers.forEach(user => {
        if (!selectedUsers.some(u => u.id === user.id)) {
          newSelectedUsers.push(user);
        }
      });
      setSelectedUsers(newSelectedUsers);
    }
  };

  // Xử lý xóa người dùng khỏi danh sách đã chọn
  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  // Xử lý thay đổi giá trị trong context
  const handleContextChange = (key: string, value: any) => {
    setEmailData((prev) => ({
      ...prev,
      context: {
        ...prev.context,
        [key]: value,
      },
    }));
  };

  // Xử lý gửi email
  const handleSendEmail = async () => {
    if (selectedUsers.length === 0) {
      setError("Vui lòng chọn ít nhất một người nhận");
      return;
    }

    if (!selectedTemplate) {
      setError("Vui lòng chọn mẫu email");
      return;
    }

    try {
      setSending(true);
      setError(null);
      
      // Gửi email cho từng người dùng đã chọn
      for (const user of selectedUsers) {
        // Cập nhật context tùy theo mẫu email và người nhận
        const updatedContext = { ...emailData.context };
        
        if (selectedTemplate === "warning_advisor" && user.role === "advisor") {
          updatedContext.advisor_name = user.name || user.username;
        }
        
        if (selectedTemplate === "warning_student" && user.role === "student") {
          updatedContext.student_name = user.name || user.username;
          updatedContext.student_code = user.student_code || "";
        }
        
        if (selectedTemplate === "welcome") {
          updatedContext.name = user.name || user.username;
          updatedContext.email = user.email;
          updatedContext.username = user.username;
        }
        
        // Gửi email
        await mailService.sendEmail({
          to: user.email,
          subject: emailData.subject,
          template: emailData.template,
          context: updatedContext,
        });
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reset form sau khi gửi thành công
      setSelectedUsers([]);
      
    } catch (err) {
      console.error("Error sending emails:", err);
      setError("Không thể gửi email. Vui lòng thử lại sau.");
    } finally {
      setSending(false);
    }
  };

  // Lọc người dùng theo vai trò và từ khóa tìm kiếm
  const getFilteredUsers = () => {
    return users.filter((user) => {
      // Lọc theo vai trò
      if (roleFilter !== "all" && user.role !== roleFilter) {
        return false;
      }

      // Tìm kiếm theo từ khóa
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.name && user.name.toLowerCase().includes(searchLower)) ||
          (user.student_code && user.student_code.toLowerCase().includes(searchLower)) ||
          (user.advisor_code && user.advisor_code.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  };

  const filteredUsers = getFilteredUsers();

  // Kiểm tra xem tất cả người dùng đã được chọn chưa
  const allSelected = filteredUsers.length > 0 && 
    filteredUsers.every(user => selectedUsers.some(u => u.id === user.id));

  // Render biểu mẫu theo loại template đã chọn
  const renderTemplateForm = () => {
    if (!selectedTemplate) return null;

    switch (selectedTemplate) {
      case "warning_advisor":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Học kỳ
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={emailData.context.semester || ""}
                onChange={(e) => handleContextChange("semester", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số sinh viên cần hỗ trợ
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                value={emailData.context.warning_count || ""}
                onChange={(e) => handleContextChange("warning_count", parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yêu cầu hành động
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={emailData.context.action_required || ""}
                onChange={(e) => handleContextChange("action_required", e.target.value)}
              />
            </div>
          </div>
        );

      case "warning_student":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Học kỳ
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={emailData.context.semester || ""}
                onChange={(e) => handleContextChange("semester", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mức cảnh báo
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={emailData.context.warning_level || ""}
                onChange={(e) => handleContextChange("warning_level", e.target.value)}
              >
                <option value="Cảnh báo mức 1">Cảnh báo mức 1</option>
                <option value="Cảnh báo mức 2">Cảnh báo mức 2</option>
                <option value="Cảnh báo mức 3">Cảnh báo mức 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm trung bình tích lũy
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={emailData.context.gpa || ""}
                onChange={(e) => handleContextChange("gpa", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày hẹn gặp
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={emailData.context.meeting_date || ""}
                onChange={(e) => handleContextChange("meeting_date", e.target.value)}
              />
            </div>
          </div>
        );

      case "welcome":
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Email chào mừng sẽ được gửi đến người dùng với thông tin cá nhân của họ.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-900">
            Gửi email thông báo
          </h1>
        </div>

        {/* Thông báo lỗi và thành công */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
            <FaCheck className="mr-2" />
            Email đã được gửi thành công!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Danh sách người dùng */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Chọn người nhận</h2>
            
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              {/* Tìm kiếm */}
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  className="w-full p-2 pl-10 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              {/* Lọc theo vai trò */}
              <select
                className="p-2 border rounded-lg"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="student">Sinh viên</option>
                <option value="advisor">Cố vấn</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {/* Chọn tất cả */}
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="select-all"
                className="mr-2"
                checked={allSelected}
                onChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm">
                Chọn tất cả ({filteredUsers.length})
              </label>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[400px]">
                {filteredUsers.length > 0 ? (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                          selectedUsers.some((u) => u.id === user.id)
                            ? "bg-indigo-50 border-indigo-300"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleSelectUser(user)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.some((u) => u.id === user.id)}
                          onChange={() => {}}
                          className="mr-3"
                        />
                        <div className="mr-3">
                          {user.role === "student" ? (
                            <FaUserGraduate className="text-blue-500" />
                          ) : user.role === "advisor" ? (
                            <FaUserTie className="text-green-500" />
                          ) : (
                            <FaUsers className="text-purple-500" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{user.name || user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          {user.student_code && (
                            <p className="text-xs text-gray-500">
                              MSSV: {user.student_code}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy người dùng nào phù hợp
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Soạn email */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Soạn email</h2>

            <div className="mb-6">
              <h3 className="font-medium mb-2 flex items-center">
                <FaUsers className="mr-2" />
                Người nhận ({selectedUsers.length})
              </h3>
              
              {selectedUsers.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center"
                    >
                      <span className="mr-1">
                        {user.name || user.username} ({user.role})
                      </span>
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-4">Chưa chọn người nhận</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn mẫu email
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">-- Chọn mẫu email --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              
              {selectedTemplate && (
                <p className="mt-1 text-sm text-gray-500">
                  {templates.find((t) => t.id === selectedTemplate)?.description}
                </p>
              )}
            </div>

            {selectedTemplate && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={emailData.subject}
                    onChange={(e) =>
                      setEmailData({ ...emailData, subject: e.target.value })
                    }
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung email
                  </label>
                  
                  {renderTemplateForm()}
                </div>

                <div className="flex justify-end">
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center"
                    onClick={handleSendEmail}
                    disabled={sending || selectedUsers.length === 0}
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
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmailSender; 