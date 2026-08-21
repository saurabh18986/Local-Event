import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box, Avatar,
  Menu, MenuItem, Badge, Tooltip, Chip, Divider, useMediaQuery, Drawer, List, ListItem, ListItemText
} from '@mui/material';
import {
  EventNote, AddCircleOutline, NotificationsNone, Menu as MenuIcon,
  ExploreOutlined, Person, Logout, Login as LoginIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

const TAG_COLORS = { music: '#a855f7', art: '#f59e0b', workshop: '#10b981', sports: '#3b82f6', meetup: '#ec4899', technology: '#06b6d4', food: '#f97316', networking: '#8b5cf6', other: '#6b7280' };

export default function Navbar() {
  const { user, logout, notifications, clearNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [
    { label: 'Explore', path: '/events', icon: <ExploreOutlined fontSize="small" /> },
  ];

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 3 } }}>
        {/* Logo */}
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', flexGrow: 1 }}>
          <EventNote sx={{ color: 'primary.light', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #a855f7, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EventHub
          </Typography>
        </Box>

        {isMobile ? (
          <>
            <IconButton onClick={() => setDrawerOpen(true)} color="inherit"><MenuIcon /></IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
              PaperProps={{ sx: { background: '#13131a', width: 260, pt: 2 } }}>
              <List>
                {navLinks.map((l) => (
                  <ListItem key={l.path} button onClick={() => { navigate(l.path); setDrawerOpen(false); }}>
                    <ListItemText primary={l.label} />
                  </ListItem>
                ))}
                {user ? (
                  <>
                    <ListItem button onClick={() => { navigate('/create-event'); setDrawerOpen(false); }}>
                      <ListItemText primary="Create Event" />
                    </ListItem>
                    <ListItem button onClick={() => { navigate(`/profile/${user._id}`); setDrawerOpen(false); }}>
                      <ListItemText primary="My Profile" />
                    </ListItem>
                    <ListItem button onClick={() => { logout(); setDrawerOpen(false); }}>
                      <ListItemText primary="Logout" />
                    </ListItem>
                  </>
                ) : (
                  <>
                    <ListItem button onClick={() => { navigate('/login'); setDrawerOpen(false); }}>
                      <ListItemText primary="Login" />
                    </ListItem>
                    <ListItem button onClick={() => { navigate('/register'); setDrawerOpen(false); }}>
                      <ListItemText primary="Sign Up" />
                    </ListItem>
                  </>
                )}
              </List>
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {navLinks.map((l) => (
              <Button key={l.path} component={Link} to={l.path} startIcon={l.icon}
                sx={{ color: location.pathname === l.path ? 'primary.light' : 'text.secondary', '&:hover': { color: 'primary.light', background: 'rgba(124,58,237,0.1)' } }}>
                {l.label}
              </Button>
            ))}

            {user ? (
              <>
                <Button variant="contained" startIcon={<AddCircleOutline />} onClick={() => navigate('/create-event')} size="small">
                  Create
                </Button>
                {/* Notifications */}
                <Tooltip title="Notifications">
                  <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
                    <Badge badgeContent={notifications.length} color="error" max={9}>
                      <NotificationsNone />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)}
                  PaperProps={{ sx: { background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', minWidth: 300 } }}>
                  {notifications.length === 0 ? (
                    <MenuItem disabled><Typography variant="body2" color="text.secondary">No new notifications</Typography></MenuItem>
                  ) : (
                    notifications.map((n, i) => (
                      <MenuItem key={i} onClick={() => { clearNotification(i); setNotifAnchor(null); navigate(`/events/${n.eventId}`); }}
                        sx={{ whiteSpace: 'normal', maxWidth: 320 }}>
                        <Typography variant="body2">{n.message}</Typography>
                      </MenuItem>
                    ))
                  )}
                </Menu>

                {/* Avatar menu */}
                <Tooltip title={user.name}>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <Avatar src={user.profileImage} sx={{ width: 36, height: 36, border: '2px solid rgba(124,58,237,0.6)' }}>
                      {user.name?.[0]}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                  PaperProps={{ sx: { background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', minWidth: 180 } }}>
                  <MenuItem onClick={() => { navigate(`/profile/${user._id}`); setAnchorEl(null); }}>
                    <Person fontSize="small" sx={{ mr: 1.5 }} /> Profile
                  </MenuItem>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />
                  <MenuItem onClick={() => { logout(); setAnchorEl(null); navigate('/'); }} sx={{ color: 'error.main' }}>
                    <Logout fontSize="small" sx={{ mr: 1.5 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" startIcon={<LoginIcon />} sx={{ color: 'text.secondary' }}>Login</Button>
                <Button component={Link} to="/register" variant="contained">Sign Up</Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
