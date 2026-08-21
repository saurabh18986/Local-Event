import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages (lazy loaded)
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import EventFeed from './pages/EventFeed';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import AuthCallback from './pages/AuthCallback';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<EventFeed />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
            <Route path="/edit-event/:id" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/chat/:eventId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
