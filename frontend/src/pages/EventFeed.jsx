import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, TextField, InputAdornment, Chip,
  MenuItem, Select, FormControl, InputLabel, Button, CircularProgress, Pagination, Alert, Slider, Paper
} from '@mui/material';
import { Search, MyLocation, FilterList } from '@mui/icons-material';
import EventCard from '../components/EventCard';
import api from '../api/axios';

const TAGS = ['music', 'art', 'workshop', 'sports', 'meetup', 'technology', 'food', 'networking', 'other'];
const TAG_COLORS = { music: '#a855f7', art: '#f59e0b', workshop: '#10b981', sports: '#3b82f6', meetup: '#ec4899', technology: '#06b6d4', food: '#f97316', networking: '#8b5cf6', other: '#6b7280' };

export default function EventFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTags, setSelectedTags] = useState(searchParams.get('tags') ? [searchParams.get('tags')] : []);
  const [sortBy, setSortBy] = useState('date');
  const [radius, setRadius] = useState(50);
  const [page, setPage] = useState(1);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (selectedTags.length) params.tags = selectedTags.join(',');
      if (userLocation) { params.lat = userLocation.lat; params.lng = userLocation.lng; params.radius = radius; }

      const { data } = await api.get('/events', { params });
      setEvents(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedTags, userLocation, radius, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); setSortBy('distance'); },
      () => { setLocating(false); setError('Location access denied.'); }
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
    setPage(1);
  };

  return (
    <Box sx={{ minHeight: '100vh', pt: 4, pb: 8, background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 50%)' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>Explore Events</Typography>
          <Typography color="text.secondary">Discover what's happening near you</Typography>
        </Box>

        {/* Search + Location bar */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#13131a' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField fullWidth placeholder="Search events..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary' }} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant={userLocation ? 'contained' : 'outlined'} startIcon={locating ? <CircularProgress size={16} /> : <MyLocation />}
                onClick={getLocation} disabled={locating}
                sx={{ py: 1.8, borderColor: userLocation ? 'primary.main' : 'rgba(255,255,255,0.2)' }}>
                {userLocation ? 'Location Active' : 'Use My Location'}
              </Button>
            </Grid>
            {userLocation && (
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary" gutterBottom>Radius: {radius} km</Typography>
                <Slider value={radius} onChange={(_, v) => setRadius(v)} min={5} max={200} step={5} color="primary" sx={{ mt: 1 }} />
              </Grid>
            )}
          </Grid>

          {/* Tag filters */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            <FilterList sx={{ color: 'text.secondary', fontSize: 18, mt: 0.4 }} />
            {TAGS.map((tag) => (
              <Chip key={tag} label={tag} size="small" clickable onClick={() => toggleTag(tag)}
                variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                sx={{
                  bgcolor: selectedTags.includes(tag) ? `${TAG_COLORS[tag]}25` : 'transparent',
                  color: TAG_COLORS[tag],
                  borderColor: selectedTags.includes(tag) ? TAG_COLORS[tag] : 'rgba(255,255,255,0.15)',
                  fontWeight: 600,
                  '&:hover': { bgcolor: `${TAG_COLORS[tag]}20` },
                }} />
            ))}
            {selectedTags.length > 0 && (
              <Chip label="Clear" size="small" onClick={() => setSelectedTags([])} sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.15)' }} variant="outlined" />
            )}
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Results count */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography color="text.secondary" variant="body2">
            {loading ? 'Loading...' : `${pagination.total} event${pagination.total !== 1 ? 's' : ''} found`}
            {userLocation && ' · Sorted by distance'}
          </Typography>
        </Box>

        {/* Event Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={48} /></Box>
        ) : events.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>No events found</Typography>
            <Typography color="text.secondary">Try adjusting your filters or search query</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <EventCard event={event} distance={event.distance} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination count={pagination.pages} page={page} onChange={(_, v) => setPage(v)}
              color="primary" size="large"
              sx={{ '& .MuiPaginationItem-root': { color: 'text.secondary' }, '& .Mui-selected': { background: 'rgba(124,58,237,0.25) !important', color: 'primary.light' } }} />
          </Box>
        )}
      </Container>
    </Box>
  );
}
