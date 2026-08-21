import React from 'react';
import { Box, Avatar, Typography, Rating } from '@mui/material';
import { format } from 'date-fns';

export default function ReviewCard({ review }) {
  return (
    <Box sx={{ p: 2.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', mb: 2, transition: 'border-color 0.2s', '&:hover': { borderColor: 'rgba(124,58,237,0.3)' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Avatar src={review.reviewer?.profileImage} sx={{ width: 40, height: 40 }}>
          {review.reviewer?.name?.[0]}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{review.reviewer?.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(review.createdAt), 'MMM d, yyyy')}
          </Typography>
        </Box>
        <Rating value={review.rating} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
      </Box>
      {review.comment && (
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {review.comment}
        </Typography>
      )}
    </Box>
  );
}
