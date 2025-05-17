import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';

interface Student {
  id: string;
  name: string;
  email: string;
}

const EmailSystem: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Mock data - thay thế bằng API call thực tế
  const students: Student[] = [
    { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com' },
    { id: '2', name: 'Trần Thị B', email: 'tranthib@example.com' },
  ];

  const handleSendEmail = async () => {
    try {
      // Thêm logic gửi email ở đây
      // await sendEmail({
      //   to: students.find(s => s.id === selectedStudent)?.email,
      //   subject,
      //   content
      // });
      
      setStatus('success');
      setSubject('');
      setContent('');
      setSelectedStudent('');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Gửi Email cho Sinh viên
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Chọn sinh viên</InputLabel>
        <Select
          value={selectedStudent}
          label="Chọn sinh viên"
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          {students.map((student) => (
            <MenuItem key={student.id} value={student.id}>
              {student.name} - {student.email}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Tiêu đề"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Nội dung"
        multiline
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSendEmail}
        disabled={!selectedStudent || !subject || !content}
      >
        Gửi Email
      </Button>

      {status === 'success' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Email đã được gửi thành công!
        </Alert>
      )}

      {status === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Có lỗi xảy ra khi gửi email. Vui lòng thử lại!
        </Alert>
      )}
    </Box>
  );
};

export default EmailSystem; 