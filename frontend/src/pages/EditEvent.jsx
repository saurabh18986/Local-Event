import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Grid, Chip, Alert, Paper,
  InputAdornment, CircularProgress, Snackbar
} from '@mui/material';
import { LocationOn, People, AttachMoney, Title } from '@mui/icons-material';
import EventMap from '../components/EventMap';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TAGS = ['music', 'art', 'workshop', 'sports', 'meetup', 'technology', 'food', 'networking', 'other'];
const TAG_COLORS = { music: '#a855f7', art: '#f59e0b', workshop: '#10b981', sports: '#3b82f6', meetup: '#ec4899', technology: '#06b6d4', food: '#f97316', networking: '#8b5cf6', other: '#6b7280' };

const geocodeAddress = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'LocalEventHub/1.0' } });
  const data = await res.json();
  if (!data.length) throw new Error('Address not found.');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
};

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '' });

  useEffect(() => {
    api.get(`/events/${id}`).then(({ data }) => {
      const ev = data.data;
      if (ev.creator?._id !== user?._id) { navigate(`/events/${id}`); return; }
      const [lng, lat] = ev.location?.coordinates?.coordinates || [0, 0];
      setForm({
        title: ev.title, description: ev.description,
        date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : '',
        endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : '',
        address: ev.location?.address || '',
        latitude: lat, longitude: lng,
        tags: ev.tags || [], capacity: ev.capacity, price: ev.price, image: ev.image,
      });
    }).catch(() => navigate('/events'));
  }, [id]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleGeocode = async () => {
    setGeocoding(true);
    try {
      const { lat, lng } = await geocodeAddress(form.address);
      setForm({ ...form, latitude: lat, longitude: lng });
      setSnack({ open: true, msg: '📍 Location updated!' });
    } catch (err) { setError(err.message); }
    finally { setGeocoding(false); }
  };

  const toggleTag = (tag) => {
    setForm({ ...form, tags: form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put(`/events/${id}`, form);
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally { setLoading(false); }
  };

  if (!form) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', pt: 5, pb: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>Edit Event</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Update your event details</Typography>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
                <TextField fullWidth label="Event Title" value={form.title} onChange={update('title')} required sx={{ mb: 2 }} />
                <TextField fullWidth multiline rows={4} label="Description" value={form.description} onChange={update('description')} required sx={{ mb: 2 }} />
                <TextField fullWidth label="Image URL" value={form.image} onChange={update('image')} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
                <TextField fullWidth label="Start Date & Time" type="datetime-local" value={form.date} onChange={update('date')} InputLabelProps={{ shrink: true }} required sx={{ mb: 2 }} />
                <TextField fullWidth label="End Date & Time" type="datetime-local" value={form.endDate} onChange={update('endDate')} InputLabelProps={{ shrink: true }} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
                <TextField fullWidth label="Capacity (0 = unlimited)" type="number" value={form.capacity} onChange={update('capacity')} sx={{ mb: 2 }} inputProps={{ min: 0 }} />
                <TextField fullWidth label="Price ₹ (0 = free)" type="number" value={form.price} onChange={update('price')} inputProps={{ min: 0 }} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {TAGS.map((tag) => (
                    <Chip key={tag} label={tag} clickable onClick={() => toggleTag(tag)}
                      variant={form.tags.includes(tag) ? 'filled' : 'outlined'}
                      sx={{ color: TAG_COLORS[tag], borderColor: form.tags.includes(tag) ? TAG_COLORS[tag] : 'rgba(255,255,255,0.15)', bgcolor: form.tags.includes(tag) ? `${TAG_COLORS[tag]}20` : 'transparent', fontWeight: 600 }} />
                  ))}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Location</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField fullWidth label="Address" value={form.address} onChange={update('address')} />
                  <Button variant="outlined" onClick={handleGeocode} disabled={geocoding} sx={{ minWidth: 100 }}>
                    {geocoding ? <CircularProgress size={18} /> : 'Update 📍'}
                  </Button>
                </Box>
                <EventMap lat={form.latitude} lng={form.longitude} title={form.title} height={260} interactive onLocationSelect={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 2 }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate(`/events/${id}`)} sx={{ py: 2, px: 4, borderColor: 'rgba(255,255,255,0.2)' }}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
