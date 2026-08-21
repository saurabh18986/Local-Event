import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Avatar, Button, Chip, Paper, Divider,
  CircularProgress, Rating, Tabs, Tab
} from '@mui/material';
import { Star, EventNote, Group, Edit, LocationOn } from '@mui/icons-material';
import EventCard from '../components/EventCard';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const isMe = currentUser?._id === id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, eventsRes, reviewsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get(`/events/user/${id}`),
          api.get(`/reviews/user/${id}`),
        ]);
        // If viewing own profile use auth/me for full data; else reconstruct from events creator
        if (isMe) {
          setProfile(userRes.data.user);
          // Get RSVPs for own profile
          const rsvpRes = await api.get('/rsvp/my-rsvps');
          setRsvps(rsvpRes.data.data.map((r) => r.event).filter(Boolean));
        } else {
          // Use creator info from events
          const creator = eventsRes.data.data[0]?.creator;
          setProfile(creator || { _id: id, name: 'User', profileImage: '', reputationScore: 0, totalReviews: 0 });
        }
        setEvents(eventsRes.data.data);
        setReviews(reviewsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (!profile) return null;

  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      {/* Profile Header Banner */}
      <Box sx={{ height: 220, background: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(6,182,212,0.3) 100%)', position: 'relative' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(10,10,15,1) 100%)' }} />
      </Box>

      <Container maxWidth="lg">
        {/* Avatar + Info */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, mt: '-60px', mb: 4, flexWrap: 'wrap' }}>
          <Avatar src={profile.profileImage} sx={{ width: 120, height: 120, border: '4px solid #0a0a0f', fontSize: '3rem', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
            {profile.name?.[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1, pb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{profile.name}</Typography>
            {profile.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{profile.location}</Typography>
              </Box>
            )}
            {profile.bio && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{profile.bio}</Typography>}
          </Box>
          {isMe && (
            <Button variant="outlined" startIcon={<Edit />} sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 1 }}>
              Edit Profile
            </Button>
          )}
        </Box>

        <Grid container spacing={4}>
          {/* Left — Stats */}
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>Stats</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Star sx={{ color: '#f59e0b', fontSize: 22 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{profile.reputationScore || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">Reputation ({profile.totalReviews} reviews)</Typography>
                  </Box>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <EventNote sx={{ color: 'primary.light', fontSize: 22 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{events.length}</Typography>
                    <Typography variant="caption" color="text.secondary">Events Hosted</Typography>
                  </Box>
                </Box>
                {isMe && (
                  <>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Group sx={{ color: 'secondary.main', fontSize: 22 }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{rsvps.length}</Typography>
                        <Typography variant="caption" color="text.secondary">RSVPs</Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>

            {/* Reputation stars */}
            {profile.reputationScore > 0 && (
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)', textAlign: 'center' }}>
                <Rating value={parseFloat(profile.reputationScore)} readOnly precision={0.5} sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
                <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 700, mt: 0.5 }}>
                  {profile.reputationScore} / 5.0
                </Typography>
                <Typography variant="caption" color="text.secondary">Host Reputation</Typography>
              </Paper>
            )}
          </Grid>

          {/* Right — Tabs content */}
          <Grid item xs={12} md={9}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
              mb: 3, borderBottom: '1px solid rgba(255,255,255,0.08)',
              '& .MuiTab-root': { color: 'text.secondary', fontWeight: 600 },
              '& .Mui-selected': { color: 'primary.light' },
              '& .MuiTabs-indicator': { backgroundColor: 'primary.light' },
            }}>
              <Tab label={`Events (${events.length})`} />
              <Tab label={`Reviews (${reviews.length})`} />
              {isMe && <Tab label={`My RSVPs (${rsvps.length})`} />}
            </Tabs>

            {tab === 0 && (
              events.length === 0 ? (
                <Typography color="text.secondary">No events hosted yet.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {events.map((ev) => (
                    <Grid item xs={12} sm={6} key={ev._id}><EventCard event={ev} /></Grid>
                  ))}
                </Grid>
              )
            )}

            {tab === 1 && (
              reviews.length === 0 ? (
                <Typography color="text.secondary">No reviews yet.</Typography>
              ) : reviews.map((r) => <ReviewCard key={r._id} review={r} />)
            )}

            {isMe && tab === 2 && (
              rsvps.length === 0 ? (
                <Typography color="text.secondary">You haven't RSVPd to any events yet.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {rsvps.map((ev) => ev && <Grid item xs={12} sm={6} key={ev._id}><EventCard event={ev} /></Grid>)}
                </Grid>
              )
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
