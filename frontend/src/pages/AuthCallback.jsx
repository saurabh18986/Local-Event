import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Handles the Google OAuth redirect — extracts token from URL and logs user in
export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/login'); return; }

    // Store token and fetch user profile
    localStorage.setItem('token', token);
    api.get('/auth/me').then(({ data }) => {
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/events'; // full reload to re-init context
    }).catch(() => navigate('/login'));
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
      <CircularProgress color="primary" size={48} />
      <Typography color="text.secondary">Completing sign in...</Typography>
    </Box>
  );
}
