import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardMedia, CardContent, CardActions, Typography, Chip, Button, Box, Avatar, Tooltip } from '@mui/material';
import { CalendarToday, LocationOn, People, Star, ArrowForward } from '@mui/icons-material';
import { format } from 'date-fns';

const TAG_COLOR_MAP = {
  music: '#a855f7', art: '#f59e0b', workshop: '#10b981', sports: '#3b82f6',
  meetup: '#ec4899', technology: '#06b6d4', food: '#f97316', networking: '#8b5cf6', other: '#6b7280',
};

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
  'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=400&q=80',
];

export default function EventCard({ event, distance }) {
  const navigate = useNavigate();
  const imgSrc = event.image || PLACEHOLDER_IMAGES[parseInt(event._id?.slice(-1), 16) % PLACEHOLDER_IMAGES.length];
  const isPast = new Date(event.date) < new Date();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer' }}
      onClick={() => navigate(`/events/${event._id}`)}>
      {isPast && (
        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, bgcolor: 'rgba(0,0,0,0.7)', px: 1, py: 0.3, borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">Past Event</Typography>
        </Box>
      )}

      {/* Price badge */}
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
        <Chip label={event.isFree ? 'FREE' : `₹${event.price}`}
          size="small"
          sx={{ bgcolor: event.isFree ? 'success.main' : 'primary.main', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
      </Box>

      <CardMedia component="img" height="180" image={imgSrc} alt={event.title}
        sx={{ objectFit: 'cover', filter: isPast ? 'grayscale(60%)' : 'none' }} />

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {event.tags?.slice(0, 2).map((tag) => (
            <Chip key={tag} label={tag} size="small"
              sx={{ bgcolor: `${TAG_COLOR_MAP[tag] || '#6b7280'}20`, color: TAG_COLOR_MAP[tag] || '#6b7280', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
          ))}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <CalendarToday sx={{ fontSize: 13, color: 'primary.light' }} />
          <Typography variant="caption" color="text.secondary">
            {format(new Date(event.date), 'EEE, MMM d · h:mm a')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <LocationOn sx={{ fontSize: 13, color: 'secondary.main' }} />
          <Typography variant="caption" color="text.secondary" noWrap>
            {event.location?.address}
          </Typography>
        </Box>

        {distance !== undefined && (
          <Typography variant="caption" sx={{ color: 'secondary.light', fontWeight: 600 }}>
            📍 {(distance / 1000).toFixed(1)} km away
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Creator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={event.creator?.profileImage} sx={{ width: 26, height: 26, fontSize: '0.7rem' }}>
            {event.creator?.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>Host</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1 }}>{event.creator?.name}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <People sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{event.attendees?.length || 0}</Typography>
          </Box>
          {event.averageRating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Star sx={{ fontSize: 14, color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700 }}>{event.averageRating}</Typography>
            </Box>
          )}
        </Box>
      </CardActions>
    </Card>
  );
}
