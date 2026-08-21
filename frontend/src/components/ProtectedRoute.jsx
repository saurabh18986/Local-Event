import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}
