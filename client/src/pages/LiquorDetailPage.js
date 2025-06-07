import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import {
  LocalBar as LocalBarIcon,
  Restaurant as RestaurantIcon,
  Info as InfoIcon,
  Room as RoomIcon,
  BarChart as BarChartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import { getLiquorById, getRecommendations } from '../services/api';

// 영어 주류명을 한국어로 변환하는 함수
function getKoreanName(englishName) {
  const liquorMapping = {
    'ale': '에일',
    'beer': '맥주',
    'lager': '라거',
    'bourbon': '버번',
    'bourbon whiskey': '버번 위스키',
    'whiskey': '위스키',
    'whisky': '위스키',
    'vodka': '보드카',
    'gin': '진',
    'rum': '럼',
    'dark rum': '다크 럼',
    'white rum': '화이트 럼',
    'tequila': '테킬라',
    'wine': '와인',
    'red wine': '적포도주',
    'white wine': '백포도주',
    'champagne': '샴페인',
    'sake': '사케',
    'soju': '소주',
    'brandy': '브랜디',
    'cognac': '코냑'
  };
  
  const normalizedName = englishName.toLowerCase();
  return liquorMapping[normalizedName] || englishName;
}

function LiquorDetailPage() {
  const { id } = useParams();
  const [liquor, setLiquor] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Check if liquor is in favorites
    const favorites = JSON.parse(localStorage.getItem('favoriteLiquors') || '[]');
    setIsFavorite(favorites.includes(parseInt(id)));
    
    // Fetch liquor details and recommendations
    fetchLiquorDetails();
  }, [id]);

  const fetchLiquorDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch liquor details
      const liquorResponse = await getLiquorById(id);
      
      if (!liquorResponse.success) {
        throw new Error('Failed to fetch liquor details');
      }
      
      setLiquor(liquorResponse.data);
      
      // Fetch recommendations for this liquor
      const recommendationsResponse = await getRecommendations(id);
      
      if (!recommendationsResponse.success) {
        throw new Error('Failed to fetch recommendations');
      }
      
      setRecommendations(recommendationsResponse.data.recommendations);
    } catch (err) {
      console.error('Error fetching liquor details:', err);
      setError('Failed to load liquor details. Please try again.');
      
      // Set mock data for development
      setLiquor({
        liquor_id: parseInt(id),
        name: "Bourbon Whiskey",
        type: "Whiskey",
        description: "American whiskey distilled from corn mash, aged in new charred oak barrels. Known for its rich, sweet flavor profile with notes of vanilla, caramel, and oak.",
        origin: "United States",
        alcohol_content: "40-50%",
        flavor_profile: ["Caramel", "Vanilla", "Oak", "Spice"],
        image_url: "/images/bourbon.jpg"
      });
      
      // Mock recommendations
      setRecommendations([
        {
          score: 0.92,
          ingredient: {
            ingredient_id: 1,
            name: "Apple",
            category: "Fruits",
            flavor_profile: ["Sweet", "Tart", "Crisp"],
            image_url: "/images/apple.jpg"
          }
        },
        {
          score: 0.85,
          ingredient: {
            ingredient_id: 3,
            name: "Cinnamon",
            category: "Spices",
            flavor_profile: ["Warm", "Sweet", "Spicy"],
            image_url: "/images/cinnamon.jpg"
          }
        },
        {
          score: 0.78,
          ingredient: {
            ingredient_id: 5,
            name: "Dark Chocolate",
            category: "Desserts",
            flavor_profile: ["Bitter", "Rich", "Sweet"],
            image_url: "/images/chocolate.jpg"
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteLiquors') || '[]');
    let newFavorites = [];
    
    if (isFavorite) {
      newFavorites = favorites.filter(item => item !== parseInt(id));
    } else {
      newFavorites = [...favorites, parseInt(id)];
    }
    
    localStorage.setItem('favoriteLiquors', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !liquor) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/liquors"
          sx={{ mt: 2 }}
        >
          주류 목록으로 돌아가기
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Back navigation */}
      <Button
        startIcon={<ArrowBackIcon />}
        component={RouterLink}
        to="/liquors"
        sx={{ mt: 3, mb: 1 }}
      >
        주류 목록으로 돌아가기
      </Button>
      
      {/* Main content */}
      <Grid container spacing={4}>
        {/* Liquor image and basic info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="300"
              image={liquor.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
              alt={liquor.name}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)'
                }
              }}
              onClick={toggleFavorite}
            >
              {isFavorite ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {liquor.name}
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 1
                }}
              >
                <LocalBarIcon fontSize="small" />
                {liquor.type || '알 수 없는 유형'}
              </Typography>
              {liquor.origin && (
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 1 
                  }}
                >
                  <RoomIcon fontSize="small" />
                  {liquor.origin}
                </Typography>
              )}
              {liquor.alcohol_content && (
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 1 
                  }}
                >
                  <BarChartIcon fontSize="small" />
                  {liquor.alcohol_content} ABV
                </Typography>
              )}
            </Box>
          </Paper>
          
          {/* Flavor profile section */}
          <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              플레이버 프로파일
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {liquor.flavor_profile && liquor.flavor_profile.length > 0 ? (
                liquor.flavor_profile.map((flavor, index) => (
                  <Chip
                    key={index}
                    label={flavor}
                    color="primary"
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography color="text.secondary">
                  플레이버 프로파일이 없습니다
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Details and tabs section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="liquor details tabs">
                <Tab label="설명" id="tab-0" />
                <Tab label="추천 페어링" id="tab-1" />
              </Tabs>
            </Box>
            
            {/* Description tab */}
            <Box role="tabpanel" hidden={tabValue !== 0} id="tabpanel-0" sx={{ minHeight: 300 }}>
              {tabValue === 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {liquor.name} 소개
                  </Typography>
                  {liquor.description ? (
                    <Typography paragraph>
                      {liquor.description}
                    </Typography>
                  ) : (
                    <Typography color="text.secondary">
                      이 주류에 대한 설명이 없습니다.
                    </Typography>
                  )}
                  
                  {/* Production process section - would be added with more detailed data */}
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    제조 과정
                  </Typography>
                  <Typography paragraph>
                    {liquor.type === 'Whiskey' ? 
                      '위스키 제조는 곱을 마싱하는 과정으로 시작해서 발효, 증류, 그리고 나무 통에서의 숙성 과정을 거칩니다. 구체적인 과정은 지역과 스타일에 따라 다르며, 버번은 최소 51%의 옥수수 마시와 새로 탄화된 오크통에서의 숙성이 필요합니다.' 
                      : '이 주류에 대한 제조 과정 정보가 없습니다.'}
                  </Typography>
                  
                  {/* Serving suggestions */}
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    서빙 제안
                  </Typography>
                  <Typography paragraph>
                    {liquor.type === 'Whiskey' ? 
                      '이 위스키는 순음으로, 온 더 락(ice)(얼음과 함께), 또는 올드 패션드나 맨하탄과 같은 클래식 칵테일에 사용하여 즐길 수 있습니다. 최고의 시음을 위해서는 글렌케언 글래스나 로우볼 텀블러에 실온이나 하나의 큰 얼음 조각과 함께 제공하세요.'
                      : '이 주류에 대한 서빙 제안이 없습니다.'}
                  </Typography>
                </>
              )}
            </Box>
            
            {/* Pairings tab */}
            <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" sx={{ minHeight: 300 }}>
              {tabValue === 1 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {getKoreanName(liquor.name)} 추천 재료 TOP 3
                  </Typography>
                  
                  {recommendations && recommendations.length > 0 ? (
                    <Grid container spacing={2}>
                      {recommendations.map((rec) => (
                        <Grid item xs={12} sm={6} md={4} key={rec.ingredient.ingredient_id}>
                          <Card 
                            sx={{ 
                              height: '100%',
                              transition: '0.3s',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: 4
                              }
                            }}
                          >
                            <CardActionArea 
                              component={RouterLink}
                              to={`/ingredients/${rec.ingredient.ingredient_id}`}
                              sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                            >
                              <CardMedia
                                component="img"
                                height="140"
                                image={rec.ingredient.image_url || 'https://via.placeholder.com/140x140?text=No+Image'}
                                alt={rec.ingredient.name}
                              />
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" component="div">
                                  {rec.ingredient.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                    페어링 점수:
                                  </Typography>
                                  <Rating 
                                    value={rec.score * 5} 
                                    precision={0.5} 
                                    readOnly 
                                    size="small"
                                  />
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    {(rec.score * 100).toFixed(0)}%
                                  </Typography>
                                </Box>
                                {rec.ingredient.flavor_profile && rec.ingredient.flavor_profile.length > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                      플레이버 프로파일:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {rec.ingredient.flavor_profile.map((flavor, idx) => (
                                        <Chip 
                                          key={idx} 
                                          label={flavor} 
                                          size="small" 
                                          color="secondary" 
                                          variant="outlined"
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography color="text.secondary">
                      이 주류에 대한 페어링 추천이 없습니다.
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to="/pairing"
                    >
                      커스텀 페어링 시도하기
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
          
          {/* Related liquors section - would be populated with real data in production */}
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              유사한 주류
            </Typography>
            <Grid container spacing={2}>
              {['Rye Whiskey', 'Scotch Whisky', 'Irish Whiskey'].map((name, index) => (
                <Grid item xs={4} key={index}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ height: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                  >
                    <LocalBarIcon sx={{ mr: 1 }} />
                    {name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Call to action */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mt: 4, 
          mb: 4, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h6">
            더 많은 완벽한 페어링을 탐색하고 싶으세요?
          </Typography>
          <Typography variant="body1">
            우리의 AI가 어떤 상황에도 이상적인 조합을 찾는 데 도움을 드립니다.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="secondary"
          component={RouterLink}
          to="/pairing"
          sx={{ minWidth: 200 }}
        >
          페어링 도구 사용해보기
        </Button>
      </Paper>
    </Container>
  );
}

export default LiquorDetailPage;