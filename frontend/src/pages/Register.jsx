import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography, Alert, InputAdornment, IconButton, Paper, Divider } from '@mui/material';
import { Person, Email, Lock, Visibility, VisibilityOff, Google } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6,182,212,0.1) 0%, transparent 60%)' }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(19,19,26,0.9)', backdropFilter: 'blur(20px)' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #a855f7, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Join EventHub
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Create your account and start exploring</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" value={form.name} onChange={update('name')}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
              sx={{ mb: 2 }} required />
            <TextField fullWidth label="Email" type="email" value={form.email} onChange={update('email')}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
              sx={{ mb: 2 }} required />
            <TextField fullWidth label="Password" type={showPass ? 'text' : 'password'} value={form.password} onChange={update('password')}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPass(!showPass)}>{showPass ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
              }}
              sx={{ mb: 2 }} required />
            <TextField fullWidth label="Confirm Password" type={showPass ? 'text' : 'password'} value={form.confirm} onChange={update('confirm')}
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
              sx={{ mb: 3 }} required />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.5, fontSize: '1rem', mb: 2 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }}>
            <Typography variant="caption" color="text.secondary">OR</Typography>
          </Divider>

          <Button fullWidth variant="outlined" startIcon={<Google />} href="/api/auth/google"
            sx={{ py: 1.5, borderColor: 'rgba(255,255,255,0.2)', color: 'text.primary', mb: 3, '&:hover': { borderColor: 'primary.main', background: 'rgba(124,58,237,0.08)' } }}>
            Sign up with Google
          </Button>

          <Typography variant="body2" color="text.secondary" align="center">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
