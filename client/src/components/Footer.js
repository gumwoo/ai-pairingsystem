import React from 'react';
import { Box, Container, Typography, Grid, Link, Divider, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import WineBarIcon from '@mui/icons-material/WineBar';
import GitHubIcon from '@mui/icons-material/GitHub';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        mt: 'auto',
        background: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
        color: 'rgba(255, 255, 255, 0.7)',
        pt: 6,
        pb: 4,
        borderTop: '1px solid rgba(139, 69, 19, 0.2)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <WineBarIcon 
                sx={{ 
                  color: '#D4AF37', 
                  mr: 1.5, 
                  fontSize: 32 
                }} 
              />
              <Typography 
                variant="h5" 
                component="div"
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '-0.01em',
                }}
              >
                찰떡궁합
              </Typography>
            </Box>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                maxWidth: 400,
                lineHeight: 1.7, 
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
              }}
            >
              AI 기반 분석으로 완벽한 주류와 음식의 페어링을 추천하는 전문적인 서비스입니다. 전문가 수준의 정확한 분석을 제공합니다.
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon sx={{ fontSize: 20, mr: 1.5, color: '#D4AF37' }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                전북대학교 SW중심대학사업단
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                position: 'relative',
                paddingBottom: 1.5,
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: 40,
                  height: 2,
                  backgroundColor: '#D4AF37',
                  borderRadius: '1px',
                }
              }}
            >
              서비스
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link 
                component={RouterLink} 
                to="/" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  display: 'block',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.95rem',
                  '&:hover': { 
                    color: '#D4AF37',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                홈
              </Link>
              <Link 
                component={RouterLink} 
                to="/pairing" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  display: 'block',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.95rem',
                  '&:hover': { 
                    color: '#D4AF37',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                페어링 분석
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                position: 'relative',
                paddingBottom: 1.5,
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: 40,
                  height: 2,
                  backgroundColor: '#D4AF37',
                  borderRadius: '1px',
                }
              }}
            >
              리소스
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link 
                href="https://github.com/woojung1234/ai-pairingsystem" 
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  display: 'flex', 
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.95rem',
                  '&:hover': { 
                    color: '#D4AF37',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <GitHubIcon sx={{ mr: 1.5, fontSize: 18 }} />
                GitHub 저장소
              </Link>
              
              <Link 
                href="#"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.95rem',
                  '&:hover': { 
                    color: '#D4AF37',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                API 문서
              </Link>
              
              <Link 
                href="#"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.95rem',
                  '&:hover': { 
                    color: '#D4AF37',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                이용약관
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Divider 
          sx={{ 
            my: 4, 
            backgroundColor: 'rgba(139, 69, 19, 0.2)' 
          }} 
        />
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
            }}
          >
            © {currentYear} 찰떡궁합. 모든 권리 보유.
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: { xs: 1, sm: 0 }, 
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
            }}
          >
            전북대학교 캡스톤 디자인 프로젝트
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;