import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Grid, Chip, MenuItem,
  FormControl, InputLabel, Select, Alert, Paper, Snackbar, OutlinedInput,
  InputAdornment, CircularProgress, Stepper, Step, StepLabel
} from '@mui/material';
import { Title, Description, CalendarToday, LocationOn, People, AttachMoney, LocalOffer } from '@mui/icons-material';
import EventMap from '../components/EventMap';
import api from '../api/axios';

const TAGS = ['music', 'art', 'workshop', 'sports', 'meetup', 'technology', 'food', 'networking', 'other'];
const TAG_COLORS = { music: '#a855f7', art: '#f59e0b', workshop: '#10b981', sports: '#3b82f6', meetup: '#ec4899', technology: '#06b6d4', food: '#f97316', networking: '#8b5cf6', other: '#6b7280' };

const geocodeAddress = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'LocalEventHub/1.0' } });
  const data = await res.json();
  if (data.length === 0) throw new Error('Address not found. Please try a more specific address.');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', date: '', endDate: '',
    address: '', latitude: null, longitude: null,
    tags: [], capacity: 0, price: 0, image: '',
  });
  const [geocoding, setGeocoding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '' });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleGeocode = async () => {
    if (!form.address.trim()) return setError('Please enter an address first.');
    setGeocoding(true);
    setError('');
    try {
      const { lat, lng, display } = await geocodeAddress(form.address);
      setForm({ ...form, latitude: lat, longitude: lng, address: display });
      setSnack({ open: true, msg: '📍 Location found on map!' });
    } catch (err) {
      setError(err.message);
    } finally { setGeocoding(false); }
  };

  const handleMapClick = (lat, lng) => {
    setForm({ ...form, latitude: lat, longitude: lng });
  };

  const toggleTag = (tag) => {
    setForm({ ...form, tags: form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) return setError('Please geocode an address or click on the map to set a location.');
    if (!form.date) return setError('Please set the event date.');
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/events', form);
      navigate(`/events/${data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', pt: 5, pb: 8, background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 50%)' }}>
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>Create Event</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Fill in the details to host your event</Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>📋 Basic Info</Typography>
                <TextField fullWidth label="Event Title" value={form.title} onChange={update('title')} required sx={{ mb: 2 }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Title sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment> }} />
                <TextField fullWidth multiline rows={4} label="Description" value={form.description} onChange={update('description')} required sx={{ mb: 2 }}
                  placeholder="Tell people what your event is about..." />
                <TextField fullWidth label="Event Image URL (optional)" value={form.image} onChange={update('image')} placeholder="https://..." />
              </Paper>
            </Grid>

            {/* Date & Time */}
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>📅 Date & Time</Typography>
                <TextField fullWidth label="Start Date & Time" type="datetime-local" value={form.date} onChange={update('date')}
                  InputLabelProps={{ shrink: true }} required sx={{ mb: 2 }} />
                <TextField fullWidth label="End Date & Time (optional)" type="datetime-local" value={form.endDate} onChange={update('endDate')}
                  InputLabelProps={{ shrink: true }} />
              </Paper>
            </Grid>

            {/* Capacity & Price */}
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>⚙️ Settings</Typography>
                <TextField fullWidth label="Capacity (0 = unlimited)" type="number" value={form.capacity} onChange={update('capacity')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><People sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment> }}
                  sx={{ mb: 2 }} inputProps={{ min: 0 }} />
                <TextField fullWidth label="Price in ₹ (0 = free)" type="number" value={form.price} onChange={update('price')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment> }}
                  inputProps={{ min: 0 }} />
              </Paper>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>🏷️ Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {TAGS.map((tag) => (
                    <Chip key={tag} label={tag} clickable onClick={() => toggleTag(tag)}
                      variant={form.tags.includes(tag) ? 'filled' : 'outlined'}
                      sx={{
                        bgcolor: form.tags.includes(tag) ? `${TAG_COLORS[tag]}25` : 'transparent',
                        color: TAG_COLORS[tag], borderColor: form.tags.includes(tag) ? TAG_COLORS[tag] : 'rgba(255,255,255,0.15)',
                        fontWeight: 600, '&:hover': { bgcolor: `${TAG_COLORS[tag]}20` },
                      }} />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>📍 Location</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField fullWidth label="Address" value={form.address} onChange={update('address')} placeholder="Enter address and click Find..."
                    InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment> }} />
                  <Button variant="outlined" onClick={handleGeocode} disabled={geocoding} sx={{ minWidth: 110, whiteSpace: 'nowrap' }}>
                    {geocoding ? <CircularProgress size={20} /> : 'Find 📍'}
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Or click directly on the map to drop a pin
                </Typography>
                <EventMap
                  lat={form.latitude || 20.5937}
                  lng={form.longitude || 78.9629}
                  title={form.title || 'Your Event'}
                  height={300}
                  interactive
                  onLocationSelect={handleMapClick}
                />
                {form.latitude && (
                  <Typography variant="caption" sx={{ color: 'success.main', mt: 1, display: 'block' }}>
                    ✓ Coordinates set: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 2, fontSize: '1.05rem' }}>
                {loading ? 'Creating Event...' : '🚀 Publish Event'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
