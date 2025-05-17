import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import AcademicWarning from '../AcademicWarning';
import Chat from '../chat';
import EmailSystem from './EmailSystem';

const AdvisorDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trang cố vấn học tập
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <AcademicWarning />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Chat />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <EmailSystem />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvisorDashboard; 