import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Button, Chip, Avatar, Divider,
  CircularProgress, Alert, Paper, Rating, TextField, Snackbar, AvatarGroup, Tooltip, IconButton
} from '@mui/material';
import { CalendarToday, LocationOn, People, Star, Chat, Edit, Delete, ArrowBack, CheckCircle, Cancel } from '@mui/icons-material';
import { format } from 'date-fns';
import EventMap from '../components/EventMap';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TAG_COLORS = { music: '#a855f7', art: '#f59e0b', workshop: '#10b981', sports: '#3b82f6', meetup: '#ec4899', technology: '#06b6d4', food: '#f97316', networking: '#8b5cf6', other: '#6b7280' };

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myRsvp, setMyRsvp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [myReview, setMyReview] = useState(null);

  useEffect(() => {
    fetchEvent();
    fetchReviews();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.data);
      if (user) {
        const isAttendee = data.data.attendees?.some((a) => a._id === user._id);
        setMyRsvp(isAttendee);
      }
    } catch { navigate('/events'); }
    finally { setLoading(false); }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${id}`);
      setReviews(data.data);
      if (user) setMyReview(data.data.find((r) => r.reviewer?._id === user._id));
    } catch {}
  };

  const handleRSVP = async () => {
    if (!user) return navigate('/login');
    setRsvpLoading(true);
    try {
      if (myRsvp) {
        await api.delete(`/rsvp/${id}`);
        setMyRsvp(false);
        setSnack({ open: true, msg: 'RSVP cancelled.', severity: 'info' });
      } else {
        await api.post(`/rsvp/${id}`);
        setMyRsvp(true);
        setSnack({ open: true, msg: "🎉 You're going!", severity: 'success' });
      }
      fetchEvent();
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Error', severity: 'error' });
    } finally { setRsvpLoading(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await api.post(`/reviews/${id}`, reviewForm);
      setSnack({ open: true, msg: 'Review submitted!', severity: 'success' });
      fetchReviews();
      fetchEvent();
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Error submitting review', severity: 'error' });
    } finally { setReviewLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await api.delete(`/events/${id}`);
      navigate('/events');
    } catch { setSnack({ open: true, msg: 'Delete failed', severity: 'error' }); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress size={50} /></Box>;
  if (!event) return null;

  const isCreator = user?._id === event.creator?._id;
  const isPast = new Date(event.date) < new Date();
  const [lng, lat] = event.location?.coordinates?.coordinates || [0, 0];

  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      {/* Hero image */}
      <Box sx={{ height: { xs: 240, md: 380 }, position: 'relative', overflow: 'hidden',
        background: event.image ? `url(${event.image}) center/cover` : 'linear-gradient(135deg,#1e1e2e,#2d1b69)' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(10,10,15,0.95) 100%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/events')} sx={{ mb: 2, width: 'fit-content', color: 'rgba(255,255,255,0.7)' }}>
            Back to Events
          </Button>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 1.5 }}>
            {event.tags?.map((tag) => (
              <Chip key={tag} label={tag} size="small" sx={{ bgcolor: `${TAG_COLORS[tag]}30`, color: TAG_COLORS[tag], fontWeight: 700, border: `1px solid ${TAG_COLORS[tag]}50` }} />
            ))}
            <Chip label={event.isFree ? 'FREE' : `₹${event.price}`} size="small" sx={{ bgcolor: event.isFree ? 'rgba(16,185,129,0.2)' : 'rgba(124,58,237,0.2)', color: event.isFree ? '#10b981' : '#a855f7', fontWeight: 700 }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, textShadow: '0 2px 20px rgba(0,0,0,0.5)', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            {event.title}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -2 }}>
        <Grid container spacing={4}>
          {/* LEFT — Main content */}
          <Grid item xs={12} md={8}>
            {/* About */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>About this Event</Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>{event.description}</Typography>
            </Paper>

            {/* Map */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Location</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOn sx={{ color: 'secondary.main' }} />
                <Typography color="text.secondary">{event.location?.address}</Typography>
              </Box>
              <EventMap lat={lat} lng={lng} title={event.title} height={280} />
            </Paper>

            {/* Attendees */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Attendees <Chip label={event.attendees?.length || 0} size="small" color="primary" sx={{ ml: 1, fontWeight: 700 }} />
                </Typography>
                {(isCreator || myRsvp) && (
                  <Button size="small" startIcon={<Chat />} variant="outlined" onClick={() => navigate(`/chat/${id}`)}>
                    Group Chat
                  </Button>
                )}
              </Box>
              {event.attendees?.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {event.attendees.slice(0, 15).map((a) => (
                    <Tooltip key={a._id} title={a.name}>
                      <Avatar component={Link} to={`/profile/${a._id}`} src={a.profileImage} sx={{ width: 44, height: 44, cursor: 'pointer', border: '2px solid rgba(124,58,237,0.4)', textDecoration: 'none' }}>
                        {a.name?.[0]}
                      </Avatar>
                    </Tooltip>
                  ))}
                  {event.attendees.length > 15 && <Chip label={`+${event.attendees.length - 15} more`} variant="outlined" size="small" />}
                </Box>
              ) : <Typography color="text.secondary" variant="body2">No RSVPs yet — be the first!</Typography>}
            </Paper>

            {/* Reviews */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Reviews</Typography>
                {event.averageRating > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                    <Star sx={{ color: '#f59e0b', fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 700, color: '#f59e0b' }}>{event.averageRating}</Typography>
                    <Typography variant="caption" color="text.secondary">({event.totalReviews})</Typography>
                  </Box>
                )}
              </Box>

              {/* Write review form */}
              {user && isPast && myRsvp && !myReview && (
                <Box component="form" onSubmit={handleReview} sx={{ mb: 3, p: 2.5, borderRadius: 2, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Leave a Review</Typography>
                  <Rating value={reviewForm.rating} onChange={(_, v) => setReviewForm({ ...reviewForm, rating: v })}
                    sx={{ mb: 2, '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
                  <TextField fullWidth multiline rows={3} placeholder="Share your experience..." value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} sx={{ mb: 2 }} />
                  <Button type="submit" variant="contained" disabled={reviewLoading}>
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Box>
              )}

              {reviews.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No reviews yet.</Typography>
              ) : reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
            </Paper>
          </Grid>

          {/* RIGHT — Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a', position: 'sticky', top: 80 }}>
              {/* Date/Time */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <CalendarToday sx={{ color: 'primary.light', mt: 0.2 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(event.date), 'h:mm a')}
                    {event.endDate && ` — ${format(new Date(event.endDate), 'h:mm a')}`}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <LocationOn sx={{ color: 'secondary.main', mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary">{event.location?.address}</Typography>
              </Box>

              {event.capacity > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <People sx={{ color: '#10b981', mt: 0.2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {event.attendees?.length}/{event.capacity} spots filled
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.07)' }} />

              {/* Host */}
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Hosted by</Typography>
              <Box component={Link} to={`/profile/${event.creator?._id}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5, mb: 3, textDecoration: 'none' }}>
                <Avatar src={event.creator?.profileImage} sx={{ width: 48, height: 48, border: '2px solid rgba(124,58,237,0.5)' }}>
                  {event.creator?.name?.[0]}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{event.creator?.name}</Typography>
                  {event.creator?.reputationScore > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ fontSize: 13, color: '#f59e0b' }} />
                      <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>{event.creator.reputationScore} reputation</Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* RSVP Button */}
              {!isCreator && !isPast && (
                <Button fullWidth variant={myRsvp ? 'outlined' : 'contained'} size="large"
                  startIcon={myRsvp ? <Cancel /> : <CheckCircle />}
                  onClick={handleRSVP} disabled={rsvpLoading}
                  color={myRsvp ? 'error' : 'primary'}
                  sx={{ py: 1.8, mb: 1.5 }}>
                  {rsvpLoading ? 'Loading...' : myRsvp ? 'Cancel RSVP' : "RSVP — I'm Going!"}
                </Button>
              )}

              {isPast && <Chip label="Event has ended" color="default" sx={{ width: '100%', py: 2, mb: 1.5 }} />}

              {/* Creator actions */}
              {isCreator && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button fullWidth variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/edit-event/${id}`)}>Edit</Button>
                  <Button fullWidth variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>Delete</Button>
                </Box>
              )}

              {(isCreator || myRsvp) && (
                <Button fullWidth variant="outlined" startIcon={<Chat />} onClick={() => navigate(`/chat/${id}`)} sx={{ mt: 1.5 }}>
                  Open Group Chat
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
