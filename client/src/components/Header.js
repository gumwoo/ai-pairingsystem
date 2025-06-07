import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Fade,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import WineBarIcon from '@mui/icons-material/WineBar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import BookmarkIcon from '@mui/icons-material/Bookmark';

// 수정된 페이지 목록 - 주류, 재료, 소개 제거
const pages = [
  { name: '홈', path: '/', icon: <HomeIcon /> },
  { name: '페어링', path: '/pairing', icon: <ShuffleIcon /> },
];

function Header({ isAuthenticated, user, onLogout }) {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleLogout = () => {
    handleCloseUserMenu();
    onLogout();
    navigate('/');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const isActivePage = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const drawerList = (
    <Box
      sx={{ 
        width: 280,
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(to bottom, #FEFCF7, #F5F1E8)',
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        p={3}
        borderBottom="1px solid rgba(139, 69, 19, 0.1)"
      >
        <Box display="flex" alignItems="center">
          <WineBarIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 28 }} />
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/"
            sx={{ 
              color: theme.palette.text.primary, 
              fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            찰떡궁합
          </Typography>
        </Box>
        <IconButton 
          onClick={toggleDrawer(false)}
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': { color: theme.palette.secondary.main }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ flexGrow: 1, mt: 2 }}>
        {pages.map((page) => (
          <ListItem 
            button 
            key={page.name} 
            component={RouterLink}
            to={page.path}
            selected={isActivePage(page.path)}
            sx={{ 
              py: 2,
              px: 3,
              mb: 1,
              borderLeft: isActivePage(page.path) 
                ? `3px solid ${theme.palette.secondary.main}` 
                : '3px solid transparent',
              backgroundColor: isActivePage(page.path) 
                ? 'rgba(139, 69, 19, 0.1)' 
                : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(139, 69, 19, 0.05)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: isActivePage(page.path) 
                  ? theme.palette.secondary.main 
                  : theme.palette.text.secondary,
                minWidth: 36,
              }}
            >
              {page.icon}
            </ListItemIcon>
            <ListItemText 
              primary={page.name} 
              primaryTypographyProps={{ 
                fontWeight: isActivePage(page.path) ? 500 : 400,
                color: isActivePage(page.path) 
                  ? theme.palette.text.primary 
                  : theme.palette.text.secondary,
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />

      <Box p={3}>
        {isAuthenticated ? (
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                alt={user?.username || 'User'} 
                sx={{ 
                  bgcolor: theme.palette.secondary.main,
                  width: 40,
                  height: 40,
                  mr: 2
                }}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : <AccountCircleIcon />}
              </Avatar>
              <Typography variant="subtitle1" color="text.primary">
                {user?.username || 'User'}
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ mb: 1 }}
            >
              로그아웃
            </Button>
          </Box>
        ) : (
          <Box>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/login"
              sx={{ mb: 1 }}
            >
              로그인
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/register"
            >
              회원가입
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <AppBar 
      position="fixed" 
      elevation={scrolled ? 4 : 0}
      sx={{ 
        backgroundColor: scrolled 
          ? 'rgba(254, 252, 247, 0.95)' 
          : 'rgba(254, 252, 247, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${scrolled 
          ? 'rgba(139, 69, 19, 0.2)' 
          : 'rgba(139, 69, 19, 0.1)'}`,
        transition: 'all 0.3s ease',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar 
          disableGutters 
          sx={{ 
            py: scrolled ? 1 : 1.5, 
            transition: 'padding 0.3s ease' 
          }}
        >
          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton
              size="large"
              aria-label="메뉴 열기"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ 
                color: theme.palette.text.primary,
                '&:hover': { color: theme.palette.secondary.main }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 3, 
              flexGrow: isMobile ? 1 : 0 
            }}
          >
            <WineBarIcon 
              sx={{ 
                color: theme.palette.primary.main, 
                mr: 1.5, 
                fontSize: { xs: 28, md: 32 },
                transition: 'all 0.3s ease',
              }} 
            />
            <Typography
              variant="h5"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
                fontWeight: 600,
                letterSpacing: '0.02em',
                color: theme.palette.text.primary,
                textDecoration: 'none',
                fontSize: scrolled ? '1.3rem' : '1.5rem',
                transition: 'all 0.3s ease',
              }}
            >
              찰떡궁합
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              display: { xs: 'none', md: 'flex' }, 
              justifyContent: 'center' 
            }}
          >
            {pages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                sx={{ 
                  mx: 1,
                  px: 2,
                  color: isActivePage(page.path) 
                    ? theme.palette.secondary.main 
                    : theme.palette.text.primary,
                  position: 'relative',
                  fontWeight: isActivePage(page.path) ? 500 : 400,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '6px',
                    left: '50%',
                    width: isActivePage(page.path) ? '20px' : '0px',
                    height: '2px',
                    backgroundColor: theme.palette.secondary.main,
                    transition: 'all 0.3s ease',
                    transform: 'translateX(-50%)',
                  },
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: theme.palette.secondary.main,
                    '&::after': {
                      width: '20px',
                    }
                  }
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Auth/Profile Menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="계정 메뉴">
                  <IconButton 
                    onClick={handleOpenUserMenu} 
                    sx={{ 
                      p: 0,
                      border: `1px solid ${theme.palette.secondary.main}`,
                      padding: '2px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(139, 69, 19, 0.1)',
                      }
                    }}
                  >
                    <Avatar 
                      alt={user?.username || 'User'} 
                      sx={{ 
                        bgcolor: 'rgba(139, 69, 19, 0.2)',
                        color: theme.palette.secondary.main,
                        width: 36,
                        height: 36
                      }}
                    >
                      {user?.username ? user.username.charAt(0).toUpperCase() : <AccountCircleIcon />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ 
                    mt: '45px',
                    '& .MuiPaper-root': {
                      background: 'rgba(254, 252, 247, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(139, 69, 19, 0.1)',
                      borderRadius: 2,
                      minWidth: 180,
                    }
                  }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  TransitionComponent={Fade}
                >
                  <Box py={1} px={2}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1, fontSize: '0.8rem', letterSpacing: '0.05em' }}
                    >
                      환영합니다
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      sx={{ fontWeight: 500, mb: 1 }}
                    >
                      {user?.username || 'User'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />

                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      py: 1.5, px: 2,
                      '&:hover': { backgroundColor: 'rgba(139, 69, 19, 0.1)' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.secondary }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="로그아웃" />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  variant="outlined"
                  sx={{ 
                    borderColor: 'rgba(139, 69, 19, 0.3)',
                    color: theme.palette.text.primary,
                    '&:hover': {
                      borderColor: theme.palette.secondary.main,
                      color: theme.palette.secondary.main,
                    }
                  }}
                >
                  로그인
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  color="secondary"
                  variant="contained"
                  sx={{ 
                    backgroundColor: theme.palette.primary.main,
                    color: '#FEFCF7',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                >
                  회원가입
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {drawerList}
      </Drawer>
    </AppBar>
  );
}

export default Header;