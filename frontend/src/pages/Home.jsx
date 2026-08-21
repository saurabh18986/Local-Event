import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Chip, Paper } from '@mui/material';
import { Explore, AddCircle, LocationOn, Group, Star, Chat } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['music', 'art', 'workshop', 'sports', 'meetup', 'technology', 'food', 'networking'];
const TAG_COLORS = { music: '#a855f7', art: '#f59e0b', workshop: '#10b981', sports: '#3b82f6', meetup: '#ec4899', technology: '#06b6d4', food: '#f97316', networking: '#8b5cf6' };

const FEATURES = [
  { icon: <LocationOn sx={{ fontSize: 32, color: '#a855f7' }} />, title: 'Near You', desc: 'Find events sorted by distance using your location' },
  { icon: <Group sx={{ fontSize: 32, color: '#06b6d4' }} />, title: 'RSVP Instantly', desc: 'One click to join — see who else is going' },
  { icon: <Chat sx={{ fontSize: 32, color: '#10b981' }} />, title: 'Group Chat', desc: 'Real-time chat with event attendees via Socket.IO' },
  { icon: <Star sx={{ fontSize: 32, color: '#f59e0b' }} />, title: 'Reviews & Ratings', desc: 'Rate hosts and build community reputation' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero */}
      <Box sx={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.2) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.15) 0%, transparent 50%)' }}>
        {/* Animated background blobs */}
        <Box sx={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', top: '-100px', right: '-100px', filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite',
          '@keyframes float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-30px)' } } }} />
        <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(6,182,212,0.06)', bottom: '-50px', left: '-80px', filter: 'blur(80px)' }} />

        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={6}>
            <Grid item xs={12} md={7}>
              <Chip label="🎉 Discover Local Events" variant="outlined"
                sx={{ mb: 3, borderColor: 'rgba(124,58,237,0.5)', color: 'primary.light', fontWeight: 600 }} />
              <Typography variant="h1" sx={{ fontSize: { xs: '2.8rem', md: '4.5rem' }, fontWeight: 900, lineHeight: 1.1, mb: 3 }}>
                Find Events{' '}
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Near You
                </Box>
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 400, lineHeight: 1.7, maxWidth: 520 }}>
                Discover concerts, workshops, meetups and sports activities happening in your city. Connect with your community.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" startIcon={<Explore />} onClick={() => navigate('/events')}
                  sx={{ px: 4, py: 1.8, fontSize: '1.05rem' }}>
                  Explore Events
                </Button>
                {user ? (
                  <Button variant="outlined" size="large" startIcon={<AddCircle />} onClick={() => navigate('/create-event')}
                    sx={{ px: 4, py: 1.8, fontSize: '1.05rem', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'primary.main' } }}>
                    Host an Event
                  </Button>
                ) : (
                  <Button variant="outlined" size="large" onClick={() => navigate('/register')}
                    sx={{ px: 4, py: 1.8, fontSize: '1.05rem', borderColor: 'rgba(255,255,255,0.2)' }}>
                    Get Started Free
                  </Button>
                )}
              </Box>

              {/* Category chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 5 }}>
                {CATEGORIES.map((cat) => (
                  <Chip key={cat} label={`# ${cat}`} size="small" clickable
                    onClick={() => navigate(`/events?tags=${cat}`)}
                    sx={{ bgcolor: `${TAG_COLORS[cat]}15`, color: TAG_COLORS[cat], border: `1px solid ${TAG_COLORS[cat]}30`, fontWeight: 600, '&:hover': { bgcolor: `${TAG_COLORS[cat]}25` } }} />
                ))}
              </Box>
            </Grid>

            {/* Stats card */}
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(19,19,26,0.8)', backdropFilter: 'blur(20px)', textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 900, background: 'linear-gradient(135deg,#a855f7,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
                  100+
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>Events Every Month</Typography>
                <Grid container spacing={2}>
                  {[{ n: '50+', l: 'Cities' }, { n: '5K+', l: 'Members' }, { n: '4.9', l: 'Avg Rating' }, { n: '200+', l: 'Hosts' }].map((s) => (
                    <Grid item xs={6} key={s.l}>
                      <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.light' }}>{s.n}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.l}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features section */}
      <Box sx={{ py: 10, background: 'rgba(19,19,26,0.5)' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" sx={{ fontWeight: 800, mb: 2 }}>Everything you need</Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6 }}>
            A complete platform to discover, host, and connect at local events
          </Typography>
          <Grid container spacing={3}>
            {FEATURES.map((f) => (
              <Grid item xs={12} sm={6} md={3} key={f.title}>
                <Paper elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid rgba(255,255,255,0.07)', background: '#13131a',
                  transition: 'all 0.3s', '&:hover': { borderColor: 'rgba(124,58,237,0.4)', transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(124,58,237,0.12)' } }}>
                  <Box sx={{ mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: 10, textAlign: 'center', background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.05) 100%)' }}>
        <Container maxWidth="sm">
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>Ready to explore?</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>Join thousands of people discovering amazing local events every day.</Typography>
          <Button variant="contained" size="large" onClick={() => navigate(user ? '/events' : '/register')} sx={{ px: 6, py: 2, fontSize: '1.1rem' }}>
            {user ? 'Browse Events' : 'Join for Free'}
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
