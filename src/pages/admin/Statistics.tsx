import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Sinh viên', value: 150 },
  { name: 'Giảng viên', value: 20 },
  { name: 'Cảnh báo học tập', value: 30 },
];

const Statistics: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Thống kê
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">150</Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng số sinh viên
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">20</Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng số giảng viên
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">30</Typography>
            <Typography variant="body2" color="text.secondary">
              Số cảnh báo học tập
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Statistics; 