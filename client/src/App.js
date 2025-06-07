import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import PairingPage from './pages/PairingPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// 모던한 와인 페어링 테마
const theme = createTheme({
  palette: {
    primary: {
      main: '#8B4513', // 갈색 (와인병 색상)
      light: '#A0522D',
      dark: '#654321',
    },
    secondary: {
      main: '#228B22', // 녹색 (화이트 와인 계열)
      light: '#32CD32',
      dark: '#006400',
    },
    tertiary: {
      main: '#B8860B', // 골든로드 (샴페인 계열)
      light: '#DAA520',
      dark: '#8B7355',
    },
    background: {
      default: '#F5F1E8', // 베이지/크림 배경
      paper: '#FEFCF7', // 더 밝은 카드 배경
    },
    text: {
      primary: '#2C2C2C', // 더 진한 회색
      secondary: '#5D4037',
    },
    divider: 'rgba(139, 69, 19, 0.2)', // 갈색 계열 구분선
    wine: {
      red: '#8B0000', // 레드 와인
      white: '#F5DEB3', // 화이트 와인
      rose: '#FFC0CB', // 로제 와인
      champagne: '#F7E7CE', // 샴페인
      dessert: '#DDA0DD', // 디저트 와인
    },
  },
  typography: {
    fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
    h1: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      fontWeight: 800,
      fontSize: '3.5rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
      color: '#2C2C2C',
    },
    h2: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      fontWeight: 700,
      fontSize: '2.75rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
      color: '#2C2C2C',
    },
    h3: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      fontWeight: 700,
      fontSize: '2.25rem',
      letterSpacing: '-0.01em',
      color: '#2C2C2C',
    },
    h4: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.005em',
      color: '#2C2C2C',
    },
    h5: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      fontWeight: 600,
      fontSize: '1.4rem',
      letterSpacing: '-0.005em',
      color: '#2C2C2C',
    },
    h6: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      fontWeight: 600,
      fontSize: '1.15rem',
      letterSpacing: '-0.005em',
      color: '#2C2C2C',
    },
    body1: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2C2C2C',
      fontWeight: 400,
    },
    body2: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      fontSize: '0.9rem',
      lineHeight: 1.6,
      color: '#5D4037',
      fontWeight: 400,
    },
    subtitle1: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      fontSize: '1.1rem',
      fontWeight: 500,
      letterSpacing: '-0.005em',
      color: '#5D4037',
    },
    subtitle2: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '-0.005em',
      color: '#5D4037',
    },
    button: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
    overline: {
      fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#8B4513',
    },
  },
  shape: {
    borderRadius: 16, // 더 둥근 모서리
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          '@import': "url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap')",
        },
        'html, body': {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: '#F5F1E8',
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(245, 241, 232, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(248, 245, 238, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(251, 248, 241, 0.6) 0%, transparent 50%)
          `,
          minHeight: '100vh',
          color: '#2C2C2C',
          fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
        },
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#F5F1E8',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(139, 69, 19, 0.3)',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(139, 69, 19, 0.5)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '0.75rem 2rem',
          transition: 'all 0.2s ease-in-out',
          fontWeight: 600,
          fontSize: '0.95rem',
          textTransform: 'none',
          letterSpacing: '-0.005em',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(139, 69, 19, 0.15)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(139, 69, 19, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: 'rgba(139, 69, 19, 0.04)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
          color: '#FEFCF7',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)',
          color: '#FEFCF7',
        },
        outlinedPrimary: {
          borderColor: '#8B4513',
          color: '#8B4513',
        },
        outlinedSecondary: {
          borderColor: '#228B22',
          color: '#228B22',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(139, 69, 19, 0.08)',
          borderBottom: 'none',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(254, 252, 247, 0.95)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FEFCF7',
          borderRadius: 20,
          border: '1px solid rgba(139, 69, 19, 0.08)',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          boxShadow: '0 2px 12px rgba(139, 69, 19, 0.06)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(139, 69, 19, 0.12)',
            borderColor: 'rgba(139, 69, 19, 0.15)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '1.5rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FEFCF7',
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(139, 69, 19, 0.08)',
        },
        elevation4: {
          boxShadow: '0 4px 12px rgba(139, 69, 19, 0.10)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(139, 69, 19, 0.12)',
          '&::before, &::after': {
            borderColor: 'rgba(139, 69, 19, 0.12)',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#8B4513',
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#A0522D',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FEFCF7',
            borderRadius: 12,
            fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
            '& fieldset': {
              borderColor: 'rgba(139, 69, 19, 0.15)',
              transition: 'border-color 0.2s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(139, 69, 19, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8B4513',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(44, 44, 44, 0.7)',
            fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
            '&.Mui-focused': {
              color: '#8B4513',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          fontSize: '0.85rem',
          fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
        },
        filled: {
          backgroundColor: 'rgba(139, 69, 19, 0.08)',
          color: '#8B4513',
        },
        outlined: {
          borderColor: 'rgba(139, 69, 19, 0.2)',
          color: '#8B4513',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: '0.75em',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTab-root': {
            color: '#5D4037',
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '1rem',
            fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
          },
          '& .MuiTab-root.Mui-selected': {
            color: '#8B4513',
            fontWeight: 600,
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#8B4513',
            height: 3,
            borderRadius: '2px 2px 0 0',
          },
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        root: {
          color: '#B8860B', // 골든로드 색상
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Function to handle login
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Header isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        <main style={{ 
          minHeight: 'calc(100vh - 160px)', 
          padding: '20px', 
          marginTop: '40px',
          background: 'transparent'
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pairing" element={<PairingPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;