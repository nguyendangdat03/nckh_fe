import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
}

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
  isHtml?: boolean;
}

export const mailService = {
  /**
   * Gửi email sử dụng template
   */
  sendEmail: async (emailData: EmailData): Promise<any> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.post(`${API_URL}/mail/send`, emailData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },
  
  /**
   * Lấy danh sách các template email có sẵn
   */
  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    // Trong thực tế, bạn có thể gọi API để lấy danh sách template
    // Ở đây chúng ta sẽ trả về danh sách mẫu cứng
    
    return [
      {
        id: "warning_advisor",
        name: "Hỗ trợ cảnh báo học tập (Cố vấn)",
        description: "Gửi thông báo cho cố vấn học tập về danh sách sinh viên cần được hỗ trợ"
      },
      {
        id: "warning_student",
        name: "Thông báo cảnh báo học tập (Sinh viên)",
        description: "Gửi thông báo cho sinh viên về tình trạng cảnh báo học tập"
      },
      {
        id: "support_student",
        name: "Hỗ trợ sinh viên bị cảnh báo",
        description: "Gửi email hỗ trợ cho sinh viên đang bị cảnh báo học tập"
      },
      {
        id: "support_student_html",
        name: "Hỗ trợ sinh viên bị cảnh báo (HTML)",
        description: "Gửi email hỗ trợ với định dạng HTML đẹp mắt"
      },
      {
        id: "admin_notification",
        name: "Thông báo từ Admin",
        description: "Gửi thông báo chính thức từ quản trị viên"
      },
      {
        id: "welcome",
        name: "Chào mừng",
        description: "Email chào mừng người dùng mới"
      }
    ];
  },
  
  /**
   * Lấy nội dung mẫu cho template email
   */
  getTemplateContent: (templateId: string): { subject: string, context: Record<string, any> } => {
    switch (templateId) {
      case "warning_advisor":
        return {
          subject: "Danh sách sinh viên cần hỗ trợ cảnh báo học tập",
          context: {
            advisor_name: "",
            semester: "Học kỳ 1 năm học 2023-2024",
            warning_count: 5,
            action_required: "Vui lòng liên hệ với sinh viên để tư vấn và hỗ trợ"
          }
        };
        
      case "warning_student":
        return {
          subject: "Thông báo về tình trạng cảnh báo học tập",
          context: {
            student_name: "",
            student_code: "",
            warning_level: "Cảnh báo mức 1",
            semester: "Học kỳ 1 năm học 2023-2024",
            gpa: "",
            advisor_name: "",
            advisor_email: "",
            meeting_date: "15/05/2023"
          }
        };
      
      case "support_student":
        return {
          subject: "Hỗ trợ học tập - Thông tin quan trọng",
          context: {
            student_name: "",
            student_code: "",
            warning_level: "",
            semester: "Học kỳ 1 năm học 2023-2024",
            gpa: "",
            credits: "",
            advisor_name: "",
            advisor_email: "",
            advisor_phone: "",
            meeting_schedule: [
              { date: "Thứ 3", time: "14:00 - 16:00", location: "Phòng B305" },
              { date: "Thứ 5", time: "9:00 - 11:00", location: "Phòng B305" }
            ],
            support_resources: [
              { name: "Trung tâm hỗ trợ học tập", link: "https://ttht.hunre.edu.vn" },
              { name: "Tài liệu học tập", link: "https://lib.hunre.edu.vn" }
            ],
            next_steps: "Đặt lịch gặp cố vấn học tập trong thời gian sớm nhất để được tư vấn phương án học tập phù hợp"
          }
        };
      
      case "support_student_html":
        return {
          subject: "Hỗ trợ học tập - Thông tin quan trọng",
          context: {
            student_name: "",
            student_code: "",
            warning_level: "",
            semester: "Học kỳ 1 năm học 2023-2024",
            gpa: "",
            credits: "",
            advisor_name: "",
            advisor_email: "",
            advisor_phone: ""
          }
        };
      
      case "admin_notification":
        return {
          subject: "Thông báo quan trọng từ Phòng Đào tạo",
          context: {
            recipient_name: "",
            recipient_role: "",
            notification_type: "",
            content: "",
            action_required: "",
            deadline: "",
            additional_info: ""
          }
        };
        
      case "welcome":
        return {
          subject: "Chào mừng bạn đến với hệ thống",
          context: {
            name: "",
            email: "",
            username: ""
          }
        };
        
      default:
        return {
          subject: "",
          context: {}
        };
    }
  },
  
  /**
   * Gửi email hỗ trợ cho sinh viên bị cảnh báo học tập
   */
  sendSupportEmail: async (studentData: any, advisorInfo: any): Promise<any> => {
    try {
      const template = "support_student";
      const templateData = mailService.getTemplateContent(template);
      
      const context = {
        ...templateData.context,
        student_name: studentData.fullName || studentData["Họ và tên"] || "",
        student_code: studentData.studentCode || studentData["Mã SV"] || "",
        warning_level: studentData.warningLevel || studentData["MỨC CẢNH BÁO HỌC TẬP ĐÃ NHẬN KỲ TRƯỚC"] || "Cảnh báo học tập",
        gpa: studentData.gpa || studentData["Điểm TB tích lũy"] || "",
        credits: studentData.credits || studentData["Tổng số TC tích lũy"] || "",
        advisor_name: advisorInfo.fullName || advisorInfo.username || "",
        advisor_email: advisorInfo.email || "",
        advisor_phone: advisorInfo.phone_number || ""
      };
      
      const emailData: EmailData = {
        to: studentData.email || "",
        subject: templateData.subject,
        template: template,
        context: context
      };
      
      return await mailService.sendEmail(emailData);
    } catch (error) {
      console.error("Error sending support email:", error);
      throw error;
    }
  },
  
  /**
   * Tạo nội dung HTML cho email hỗ trợ
   */
  generateSupportEmailHtml: (data: {
    student_name: string;
    student_code: string;
    warning_level: string;
    gpa: string;
    credits: string;
    advisor_name: string;
    advisor_email: string;
    advisor_phone: string;
    meeting_schedule?: Array<{date: string; time: string; location: string}>;
    semester?: string;
  }): string => {
    // Định nghĩa lịch họp mặt mặc định nếu không có
    const meetings = data.meeting_schedule || [
      { date: "Thứ 3", time: "14:00 - 16:00", location: "Phòng B305" },
      { date: "Thứ 5", time: "9:00 - 11:00", location: "Phòng B305" }
    ];
    
    const semester = data.semester || "Học kỳ 1 năm học 2023-2024";
    
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hỗ trợ học tập</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #3f51b5; color: white; padding: 20px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Thông báo hỗ trợ học tập</h1>
          <p style="margin: 5px 0 0; opacity: 0.8;">${semester}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="margin-top: 0;">Kính gửi <strong>${data.student_name}</strong>,</p>
          
          <p>
            Tôi là <strong>${data.advisor_name}</strong>, cố vấn học tập của bạn. Qua báo cáo học tập gần đây, tôi nhận thấy bạn đang gặp một số thách thức trong việc học và đang ở tình trạng <span style="color: #e53935; font-weight: bold;">${data.warning_level}</span>.
          </p>
          
          <div style="background-color: #f5f5f5; border-left: 4px solid #3f51b5; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #3f51b5;">Thông tin học tập của bạn:</h3>
            <ul style="padding-left: 20px; margin-bottom: 0;">
              <li><strong>Mã số sinh viên:</strong> ${data.student_code}</li>
              <li><strong>Điểm trung bình tích lũy:</strong> ${data.gpa}</li>
              <li><strong>Số tín chỉ đã tích lũy:</strong> ${data.credits}</li>
            </ul>
          </div>
          
          <p>
            Tôi muốn nhắn với bạn rằng, đây là cơ hội để cùng nhau tìm ra các giải pháp phù hợp giúp bạn cải thiện kết quả học tập. Tôi sẵn sàng hỗ trợ và tư vấn cho bạn trong thời gian tới.
          </p>
          
          <div style="background-color: #e8f5e9; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2e7d32;">Lịch gặp mặt tư vấn:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #c8e6c9;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #a5d6a7;">Ngày</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #a5d6a7;">Thời gian</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #a5d6a7;">Địa điểm</th>
                </tr>
              </thead>
              <tbody>
                ${meetings.map(meeting => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #a5d6a7;">${meeting.date}</td>
                    <td style="padding: 8px; border: 1px solid #a5d6a7;">${meeting.time}</td>
                    <td style="padding: 8px; border: 1px solid #a5d6a7;">${meeting.location}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div style="background-color: #e3f2fd; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1565c0;">Thông tin liên hệ của tôi:</h3>
            <ul style="padding-left: 20px; margin-bottom: 0;">
              <li><strong>Email:</strong> <a href="mailto:${data.advisor_email}" style="color: #1565c0;">${data.advisor_email}</a></li>
              <li><strong>Số điện thoại:</strong> ${data.advisor_phone}</li>
            </ul>
          </div>
          
          <div style="margin: 25px 0;">
            <h3 style="color: #3f51b5;">Nguồn tài nguyên hỗ trợ:</h3>
            <ul style="padding-left: 20px;">
              <li style="margin-bottom: 8px;">
                <a href="https://ttht.hunre.edu.vn" style="color: #1565c0; text-decoration: none; font-weight: bold;">Trung tâm hỗ trợ học tập</a>
                <p style="margin: 5px 0 0;">Hỗ trợ kỹ năng học tập và tài liệu tham khảo</p>
              </li>
              <li>
                <a href="https://lib.hunre.edu.vn" style="color: #1565c0; text-decoration: none; font-weight: bold;">Thư viện tài liệu học tập</a>
                <p style="margin: 5px 0 0;">Tài liệu học tập và giáo trình điện tử</p>
              </li>
            </ul>
          </div>
          
          <p>
            Tôi đề nghị bạn sắp xếp thời gian để chúng ta có thể gặp nhau trong tuần này hoặc tuần tới để thảo luận về kế hoạch học tập phù hợp cho bạn.
          </p>
          
          <p style="margin-bottom: 0;">Trân trọng,</p>
          <p style="margin-top: 5px;">
            <strong>${data.advisor_name}</strong><br>
            <em>Cố vấn học tập</em>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 15px 30px; text-align: center; font-size: 12px; color: #666;">
          <p>
            © ${new Date().getFullYear()} Trường Đại học Tài nguyên và Môi trường Hà Nội<br>
            <a href="https://hunre.edu.vn" style="color: #1565c0; text-decoration: none;">hunre.edu.vn</a>
          </p>
          <p style="margin-bottom: 0; font-size: 11px; color: #999;">
            Email này được gửi tự động từ hệ thống quản lý học tập. Vui lòng không trả lời email này.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  },
  
  /**
   * Tạo nội dung HTML cho email thông báo từ Admin
   */
  generateAdminEmailHtml: (data: {
    recipient_name: string;
    recipient_role?: string;
    notification_type: string;
    title: string;
    content: string;
    action_required?: string;
    deadline?: string;
    contact_info?: {
      name: string;
      position: string;
      email: string;
      phone?: string;
    };
    additional_links?: Array<{
      title: string;
      url: string;
      description?: string;
    }>;
  }): string => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Xử lý action required
    let actionRequiredHtml = '';
    if (data.action_required) {
      actionRequiredHtml = `
        <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #e65100; display: flex; align-items: center;">
            <span style="background: #ff9800; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; justify-content: center; align-items: center; margin-right: 10px; font-weight: bold;">!</span>
            Yêu cầu hành động
          </h3>
          <p style="margin-bottom: 5px;">${data.action_required}</p>
          ${data.deadline ? `<p style="font-weight: bold; color: #e65100; margin-top: 10px;">Thời hạn: ${data.deadline}</p>` : ''}
        </div>
      `;
    }
    
    // Xử lý thông tin liên hệ
    let contactInfoHtml = '';
    if (data.contact_info) {
      contactInfoHtml = `
        <div style="background-color: #e1f5fe; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0277bd;">Thông tin liên hệ:</h3>
          <p style="margin-bottom: 5px;"><strong>${data.contact_info.name}</strong></p>
          <p style="margin-top: 0; margin-bottom: 5px; color: #01579b;">${data.contact_info.position}</p>
          <p style="margin-top: 0; margin-bottom: 5px;">
            <strong>Email:</strong> <a href="mailto:${data.contact_info.email}" style="color: #0277bd;">${data.contact_info.email}</a>
          </p>
          ${data.contact_info.phone ? `<p style="margin-top: 0;"><strong>Điện thoại:</strong> ${data.contact_info.phone}</p>` : ''}
        </div>
      `;
    }
    
    // Xử lý các liên kết bổ sung
    let linksHtml = '';
    if (data.additional_links && data.additional_links.length > 0) {
      const linkItems = data.additional_links.map(link => `
        <li style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #e0e0e0;">
          <a href="${link.url}" style="color: #1565c0; font-weight: bold; text-decoration: none;">${link.title}</a>
          ${link.description ? `<p style="margin: 5px 0 0; color: #616161;">${link.description}</p>` : ''}
        </li>
      `).join('');
      
      linksHtml = `
        <div style="margin: 25px 0;">
          <h3 style="color: #1976d2; border-bottom: 2px solid #bbdefb; padding-bottom: 8px;">Tài liệu và liên kết:</h3>
          <ul style="padding-left: 10px; list-style-type: none;">
            ${linkItems}
          </ul>
        </div>
      `;
    }
    
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title || 'Thông báo từ Phòng Đào tạo'}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
      <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 15px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #01579b; padding: 25px 30px; text-align: center;">
          <table style="width: 100%;">
            <tr>
              <td style="width: 100px; vertical-align: middle;">
                <img src="https://hunre.edu.vn/upload/images/logo-9dau-01(1).png" alt="Logo" style="width: 80px; height: auto;">
              </td>
              <td style="vertical-align: middle; text-align: left;">
                <h1 style="margin: 0; font-size: 22px; color: white;">TRƯỜNG ĐẠI HỌC TÀI NGUYÊN VÀ MÔI TRƯỜNG HÀ NỘI</h1>
                <p style="margin: 4px 0 0; opacity: 0.9; font-size: 15px; color: white;">PHÒNG ĐÀO TẠO</p>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 15px 30px; border-bottom: 1px solid #bbdefb;">
          <h2 style="margin: 0; color: #01579b; font-size: 20px;">${data.title}</h2>
          <p style="margin: 5px 0 0; font-size: 14px; color: #0277bd;">
            <span style="display: inline-block; padding: 3px 10px; background: #0277bd; color: white; border-radius: 12px; font-size: 12px; margin-right: 10px;">${data.notification_type}</span>
            ${dateFormatted}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="margin-top: 0;">Kính gửi <strong>${data.recipient_name}</strong>${data.recipient_role ? ` (${data.recipient_role})` : ''},</p>
          
          <div style="white-space: pre-line;">${data.content}</div>
          
          ${actionRequiredHtml}
          
          ${contactInfoHtml}
          
          ${linksHtml}
          
          <p style="margin-bottom: 5px; margin-top: 25px;">Trân trọng,</p>
          <p style="margin-top: 0;">
            <strong>Phòng Đào tạo</strong><br>
            <span style="color: #555;">Trường Đại học Tài nguyên và Môi trường Hà Nội</span>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #01579b; color: white; padding: 20px 30px; text-align: center; font-size: 13px;">
          <table style="width: 100%; color: white;">
            <tr>
              <td style="vertical-align: top; text-align: left; width: 50%; padding-right: 15px;">
                <p style="margin-top: 0;"><strong>ĐỊA CHỈ</strong></p>
                <p style="margin-top: 5px; line-height: 1.4;">
                  41A Đường Phú Diễn, Phường Phú Diễn,<br>
                  Quận Bắc Từ Liêm, Hà Nội
                </p>
              </td>
              <td style="vertical-align: top; text-align: left; width: 50%;">
                <p style="margin-top: 0;"><strong>LIÊN HỆ</strong></p>
                <p style="margin-top: 5px; line-height: 1.4;">
                  ĐT: (+84) 24 3837 6741<br>
                  Email: <a href="mailto:daotao@hunre.edu.vn" style="color: white;">daotao@hunre.edu.vn</a>
                </p>
              </td>
            </tr>
          </table>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.7;">
            © ${new Date().getFullYear()} Trường Đại học Tài nguyên và Môi trường Hà Nội. Mọi quyền được bảo lưu.<br>
            Email này được gửi tự động từ hệ thống quản lý học tập. Vui lòng không trả lời email này.
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }
};

export default mailService; 