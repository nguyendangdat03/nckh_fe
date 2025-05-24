import React from 'react';

interface EmailPreviewProps {
  content: string;
  subject: string;
  studentName: string;
  studentCode: string;
  advisorName: string;
  isHtml?: boolean;
  htmlContent?: string;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({
  content,
  subject,
  studentName,
  studentCode,
  advisorName,
  isHtml = false,
  htmlContent
}) => {
  if (isHtml && htmlContent) {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="mb-2">
            <span className="font-semibold">Từ:</span> {advisorName} &lt;{advisorName.toLowerCase().replace(/\s+/g, '.')}@hunre.edu.vn&gt;
          </div>
          <div className="mb-2">
            <span className="font-semibold">Đến:</span> {studentName} &lt;{studentCode.toLowerCase()}@sv.hunre.edu.vn&gt;
          </div>
          <div className="mb-2">
            <span className="font-semibold">Chủ đề:</span> {subject}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="prose max-w-none whitespace-pre-wrap">
          {content}
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-xs text-gray-500">
        <div>Email này được gửi tự động từ hệ thống quản lý học tập</div>
        <div>© {new Date().getFullYear()} Trường Đại học Tài nguyên và Môi trường Hà Nội</div>
      </div>
    </div>
  );
};

export default EmailPreview; 