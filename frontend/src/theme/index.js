import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c3aed', light: '#a855f7', dark: '#5b21b6' },
    secondary: { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2' },
    background: { default: '#0a0a0f', paper: '#13131a' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    text: { primary: '#f1f5f9', secondary: '#94a3b8' },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 22px',
          fontSize: '0.925rem',
          transition: 'all 0.2s ease',
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 25px rgba(124,58,237,0.35)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#13131a',
          border: '1px solid rgba(255,255,255,0.07)',
          transition: 'all 0.3s ease',
          '&:hover': { border: '1px solid rgba(124,58,237,0.4)', boxShadow: '0 8px 32px rgba(124,58,237,0.15)', transform: 'translateY(-4px)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(124,58,237,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#7c3aed' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          boxShadow: 'none',
        },
      },
    },
  },
});

export default theme;
