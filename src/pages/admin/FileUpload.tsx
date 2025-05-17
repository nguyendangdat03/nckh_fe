import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          selectedFile.type === 'application/vnd.ms-excel') {
        setFile(selectedFile);
        setUploadStatus('idle');
      } else {
        setUploadStatus('error');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      // Thêm logic upload file ở đây
      const formData = new FormData();
      formData.append('file', file);

      // Gọi API upload
      // await uploadFile(formData);
      
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Upload File Excel
      </Typography>
      
      <input
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        id="file-upload"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
        >
          Chọn File
        </Button>
      </label>

      {file && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            File đã chọn: {file.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            sx={{ mt: 1 }}
          >
            Upload
          </Button>
        </Box>
      )}

      {uploadStatus === 'success' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Upload file thành công!
        </Alert>
      )}

      {uploadStatus === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Có lỗi xảy ra khi upload file. Vui lòng thử lại!
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload; 