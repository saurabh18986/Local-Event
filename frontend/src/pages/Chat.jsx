import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Paper, Avatar, IconButton,
  CircularProgress, Alert, Chip, Divider, Tooltip
} from '@mui/material';
import { Send, ArrowBack, People } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Chat() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, socket } = useAuth();
  const [event, setEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [evRes, msgRes] = await Promise.all([api.get(`/events/${eventId}`), api.get(`/messages/${eventId}`)]);
        setEvent(evRes.data.data);
        setMessages(msgRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load chat.');
      } finally { setLoading(false); }
    };
    init();
  }, [eventId]);

  // Socket.IO — join room and listen for messages
  useEffect(() => {
    if (!socket) return;
    socket.emit('join_event', eventId);
    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('user_typing', ({ userName }) => {
      if (userName !== user.name) setTyping(userName);
    });
    socket.on('user_stop_typing', () => setTyping(null));

    return () => {
      socket.emit('leave_event', eventId);
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, eventId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      await api.post(`/messages/${eventId}`, { message: input.trim() });
      setInput('');
      socket?.emit('stop_typing', { eventId });
    } catch (err) {
      setError(err.response?.data?.message || 'Send failed.');
    } finally { setSending(false); }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket?.emit('typing', { eventId, userName: user.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket?.emit('stop_typing', { eventId }), 1500);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box sx={{ px: 3, py: 2, background: '#13131a', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(`/events/${eventId}`)} size="small"><ArrowBack /></IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{event?.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <People sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{event?.attendees?.length} attendees in chat</Typography>
          </Box>
        </Box>
        <Button size="small" variant="outlined" component={Link} to={`/events/${eventId}`} sx={{ borderColor: 'rgba(255,255,255,0.15)' }}>
          View Event
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mx: 3, mt: 1 }}>{error}</Alert>}

      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 2,
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 3 } }}>

        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">No messages yet. Say hello! 👋</Typography>
          </Box>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender?._id === user?._id;
          const showAvatar = i === 0 || messages[i - 1]?.sender?._id !== msg.sender?._id;
          return (
            <Box key={msg._id} sx={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 1, mb: 1 }}>
              {!isMe && showAvatar ? (
                <Tooltip title={msg.sender?.name}>
                  <Avatar src={msg.sender?.profileImage} sx={{ width: 32, height: 32, mb: 0.5 }}>
                    {msg.sender?.name?.[0]}
                  </Avatar>
                </Tooltip>
              ) : !isMe ? <Box sx={{ width: 32 }} /> : null}

              <Box sx={{ maxWidth: '70%' }}>
                {!isMe && showAvatar && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 600 }}>
                    {msg.sender?.name}
                  </Typography>
                )}
                <Box sx={{
                  px: 2, py: 1.2, borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'rgba(255,255,255,0.07)',
                  border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  mt: 0.3,
                }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.message}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                  {format(new Date(msg.createdAt), 'h:mm a')}
                </Typography>
              </Box>
            </Box>
          );
        })}

        {typing && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>{typing} is typing...</Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box component="form" onSubmit={handleSend}
        sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255,255,255,0.08)', background: '#13131a', display: 'flex', gap: 1.5 }}>
        <TextField fullWidth placeholder="Type a message..." value={input} onChange={handleTyping}
          variant="outlined" size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, background: 'rgba(255,255,255,0.04)' } }} />
        <IconButton type="submit" disabled={!input.trim() || sending}
          sx={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: 2, px: 2, '&:hover': { background: 'linear-gradient(135deg,#6d28d9,#9333ea)' }, '&:disabled': { opacity: 0.4 } }}>
          <Send sx={{ color: '#fff' }} />
        </IconButton>
      </Box>
    </Box>
  );
}
