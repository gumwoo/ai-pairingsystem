import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  IconButton,
} from '@mui/material';
import { 
  LocalBar as LocalBarIcon,
  Restaurant as RestaurantIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Fastfood as FastfoodIcon,
} from '@mui/icons-material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';

function HomePage() {
  const navigate = useNavigate();
  const [liquors, setLiquors] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 슬라이더 참조
  const liquorSliderRef = useRef(null);
  const ingredientSliderRef = useRef(null);
  
useEffect(() => {
  const fetchData = async () => {
    try {
      // API 호출은 하되, 결과는 무시하고 샘플 데이터 사용
      await axios.get('/api/liquors');
      await axios.get('/api/ingredients');
      
      console.log('API 호출은 성공했지만 샘플 데이터를 사용합니다.');
      
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    
    // 🔥 항상 샘플 데이터 사용 (이미지 URL 포함)
    setLiquors([
      { id: 1, name: "와인", type: "와인", imageUrl: "/images/wine.jpg" },
      { id: 2, name: "진", type: "진", imageUrl: "/images/gin.jpg" },
      { id: 3, name: "위스키", type: "위스키", imageUrl: "/images/whiskey.jpg" },
      { id: 4, name: "맥주", type: "맥주", imageUrl: "/images/beer.jpg" },
      { id: 5, name: "사케", type: "사케", imageUrl: "/images/sake.jpg" },
      { id: 6, name: "브랜디", type: "브랜디", imageUrl: "/images/brandy.jpg" },
    ]);

    setIngredients([
      { id: 1, name: "고기", category: "육류", imageUrl: "/images/meat.jpg" },
      { id: 2, name: "치즈", category: "유제품", imageUrl: "/images/cheese.jpg" },
      { id: 3, name: "해산물", category: "해산물", imageUrl: "/images/seafood.jpg" },
      { id: 4, name: "초콜릿", category: "디저트", imageUrl: "/images/chocolate.jpg" },
      { id: 5, name: "바질", category: "허브", imageUrl: "/images/basil.jpg" },
    ]);
    
    setLoading(false);
  };

  fetchData();
}, []);

  // 페어링 페이지로 이동
  const handlePairingExplore = () => {
    navigate('/pairing');
  };

  // 술 추천 페이지로 이동 (재료 입력)
  const handleLiquorRecommendation = () => {
    navigate('/pairing?mode=liquor-recommendation');
  };

  // 음식 추천 페이지로 이동 (술 입력)
  const handleIngredientRecommendation = () => {
    navigate('/pairing?mode=ingredient-recommendation');
  };

  // 슬라이더 설정
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false, // 기본 화살표 제거
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section - 전문적이고 식욕을 돋우는 디자인 */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 6,
          py: 8,
          px: 4,
          borderRadius: 3,
          background: `
            linear-gradient(135deg, 
              rgba(30, 30, 30, 0.7) 0%, 
              rgba(45, 35, 30, 0.75) 50%, 
              rgba(60, 45, 35, 0.7) 100%
            ),
            url('/images/wine-bg.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          border: '1px solid rgba(139, 69, 19, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
        }}
      >
        <Box textAlign="center" position="relative" zIndex={1}>
          {/* 절제된 제목 디자인 */}
          <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={2}>
            <LocalBarIcon sx={{ 
              fontSize: 28, 
              color: '#D4AF37',
              opacity: 0.9
            }} />
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                color: 'white',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              AI 와인 & 푸드 페어링
            </Typography>
            <RestaurantIcon sx={{ 
              fontSize: 28, 
              color: '#D4AF37',
              opacity: 0.9
            }} />
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4,
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: '580px',
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            전문가 수준의 AI가 분석하는 완벽한 음식과 주류의 조화
          </Typography>

          {/* 전문적인 버튼 그룹 */}
          <Box display="flex" gap={2.5} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              onClick={handlePairingExplore}
              startIcon={<AutoAwesomeIcon />}
              sx={{
                fontSize: '1rem',
                py: 1.2,
                px: 3,
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                color: '#1A1A1A',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                letterSpacing: '-0.005em',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #B8860B 0%, #D4AF37 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(212, 175, 55, 0.4)',
                },
              }}
            >
              페어링 분석
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={handleLiquorRecommendation}
              startIcon={<LocalBarIcon />}
              sx={{
                fontSize: '1rem',
                py: 1.2,
                px: 3,
                borderColor: 'rgba(212, 175, 55, 0.8)',
                color: '#D4AF37',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                fontWeight: 500,
                textTransform: 'none',
                letterSpacing: '-0.005em',
                fontFamily: "'Inter', sans-serif",
                '&:hover': {
                  borderColor: '#D4AF37',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: '#E6C547',
                },
              }}
            >
              술 추천
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={handleIngredientRecommendation}
              startIcon={<RestaurantIcon />}
              sx={{
                fontSize: '1rem',
                py: 1.2,
                px: 3,
                borderColor: 'rgba(212, 175, 55, 0.8)',
                color: '#D4AF37',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                fontWeight: 500,
                textTransform: 'none',
                letterSpacing: '-0.005em',
                fontFamily: "'Inter', sans-serif",
                '&:hover': {
                  borderColor: '#D4AF37',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: '#E6C547',
                },
              }}
            >
              음식 추천
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 주류 카테고리 슬라이더 */}
      <Box mb={6}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            color: '#2C2C2C',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 3,
            justifyContent: 'center',
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            letterSpacing: '-0.01em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <LocalBarIcon sx={{ color: '#8B4513', fontSize: 28 }} />
          인기 주류
        </Typography>
        
        {/* 슬라이더 컨테이너 */}
        <Box sx={{ position: 'relative', px: 6 }}>
          {/* 왼쪽 화살표 */}
          <IconButton
            onClick={() => liquorSliderRef.current?.slickPrev()}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(139, 69, 19, 0.1)',
              color: '#8B4513',
              '&:hover': {
                backgroundColor: 'rgba(139, 69, 19, 0.2)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          {/* 슬라이더 */}
          <Slider ref={liquorSliderRef} {...sliderSettings}>
            {liquors.map((liquor) => (
              <Box key={liquor.id} sx={{ px: 1.5 }}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    height: '300px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #8B4513, #A0522D, #654321)',
                      borderRadius: '16px 16px 0 0',
                    }
                  }}
                  onClick={() => navigate('/pairing')}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={liquor.imageUrl || 'https://via.placeholder.com/300x200?text=Wine'}
                    alt={liquor.name}
                    sx={{ 
                      objectFit: 'cover',
                      filter: 'sepia(10%) saturate(110%)',
                    }}
                  />
                  <CardContent sx={{ pb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                      {liquor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {liquor.type}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
          
          {/* 오른쪽 화살표 */}
          <IconButton
            onClick={() => liquorSliderRef.current?.slickNext()}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(139, 69, 19, 0.1)',
              color: '#8B4513',
              '&:hover': {
                backgroundColor: 'rgba(139, 69, 19, 0.2)',
              },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 음식 카테고리 슬라이더 */}
      <Box mb={6}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            color: '#2C2C2C',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 3,
            justifyContent: 'center',
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            letterSpacing: '-0.01em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <RestaurantIcon sx={{ color: '#228B22', fontSize: 28 }} />
          인기 음식
        </Typography>
        
        {/* 슬라이더 컨테이너 */}
        <Box sx={{ position: 'relative', px: 6 }}>
          {/* 왼쪽 화살표 */}
          <IconButton
            onClick={() => ingredientSliderRef.current?.slickPrev()}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(34, 139, 34, 0.1)',
              color: '#228B22',
              '&:hover': {
                backgroundColor: 'rgba(34, 139, 34, 0.2)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          {/* 슬라이더 */}
          <Slider ref={ingredientSliderRef} {...sliderSettings}>
            {ingredients.map((ingredient) => (
              <Box key={ingredient.id} sx={{ px: 1.5 }}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    height: '300px',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #228B22, #32CD32, #006400)',
                      borderRadius: '16px 16px 0 0',
                    }
                  }}
                  onClick={() => navigate('/pairing')}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={ingredient.imageUrl || 'https://via.placeholder.com/300x200?text=Food'}
                    alt={ingredient.name}
                    sx={{ 
                      objectFit: 'cover',
                      filter: 'sepia(5%) saturate(105%)',
                    }}
                  />
                  <CardContent sx={{ pb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                      {ingredient.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ingredient.category}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
          
          {/* 오른쪽 화살표 */}
          <IconButton
            onClick={() => ingredientSliderRef.current?.slickNext()}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(34, 139, 34, 0.1)',
              color: '#228B22',
              '&:hover': {
                backgroundColor: 'rgba(34, 139, 34, 0.2)',
              },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 특징 섹션 */}
      <Paper 
        elevation={0}
        sx={{ 
          py: 6,
          px: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(248, 245, 238, 0.8) 0%, rgba(245, 241, 232, 0.9) 100%)',
          border: '1px solid rgba(139, 69, 19, 0.1)',
        }}
      >
        <Typography 
          variant="h4" 
          textAlign="center" 
          sx={{ 
            mb: 4,
            fontWeight: 600,
            color: '#2C2C2C',
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            letterSpacing: '-0.01em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          전문적인 AI 페어링 서비스
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center" sx={{ p: 3 }}>
              <AutoAwesomeIcon sx={{ fontSize: 40, color: '#8B4513', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1.1rem' }}>
                AI 기반 분석
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                수천 가지 조합을 분석하여 과학적으로 검증된 최적의 페어링을 제안합니다
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box textAlign="center" sx={{ p: 3 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#228B22', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1.1rem' }}>
                개인 맞춤형
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                개인의 취향과 선호도를 학습하여 점점 더 정확한 추천을 제공합니다
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box textAlign="center" sx={{ p: 3 }}>
              <LocalBarIcon sx={{ fontSize: 40, color: '#B8860B', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1.1rem' }}>
                전문가 수준
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                소믈리에와 셰프들의 지식을 바탕으로 한 전문적인 페어링 정보를 제공합니다
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default HomePage;