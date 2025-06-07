import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import koreanPairingService from '../services/koreanPairingService';
import {
  Box, Container, Typography, Button, Grid, Card, TextField, Paper,
  Chip, CircularProgress, Fade, useTheme, useMediaQuery,
  alpha, Rating, Tab, Tabs, Alert,
} from '@mui/material';
import {
  Search as SearchIcon, WineBar as WineBarIcon, Restaurant as RestaurantIcon,
  LocalBar as LocalBarIcon, Liquor as LiquorIcon, Shuffle as ShuffleIcon,
  Star as StarIcon,
} from '@mui/icons-material';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// 막대 그래프 컴포넌트
const PairingScoreChart = ({ recommendations, title = "페어링 점수 비교", tabValue = 1 }) => {
  const theme = useTheme();
  
  if (!recommendations || recommendations.length === 0) return null;
  
  // 점수 기준으로 정렬하고 상위 5개만 선택
  const sortedRecommendations = [...recommendations]
    .sort((a, b) => (getScoreOutOf100(b.score) - getScoreOutOf100(a.score)))
    .slice(0, 5);
  
  const getItemName = (rec) => {
    return rec?.ingredient_name || rec?.liquor_name || rec?.ingredient || rec?.liquor || rec?.name || '알 수 없음';
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mt: 4, 
        borderRadius: 2,
        background: 'linear-gradient(135deg, rgba(248, 245, 238, 0.8) 0%, rgba(245, 241, 232, 0.9) 100%)'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
        📊 {title}
      </Typography>
      
      <Box sx={{ width: '100%' }}>
        {sortedRecommendations.map((rec, index) => {
          const score = getScoreOutOf100(rec.score);
          const itemName = getItemName(rec);
          const translatedName = tabValue === 1 ? translateIngredientName(itemName) : translateLiquorName(itemName);
          const barColor = getScoreColor(score);
          const barWidth = score;
          
          return (
            <Box key={index} sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: barColor,
                      minWidth: '24px',
                      fontSize: '0.9rem'
                    }}
                  >
                    #{index + 1}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: theme.palette.text.primary
                    }}
                  >
                    {translatedName}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: barColor,
                    fontSize: '0.9rem'
                  }}
                >
                  {score}점
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 20, 
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    width: `${barWidth}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${barColor}, ${alpha(barColor, 0.7)})`,
                    borderRadius: 2,
                    transition: 'width 0.8s ease-in-out',
                    position: 'relative'
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

// 영어 재료명을 한글로 번역하는 함수
const translateIngredientName = (englishName) => {
  if (!englishName || typeof englishName !== 'string') {
    return '알 수 없음';
  }

  const translations = {
    'wine': '와인', 'white_pepper': '화이트 페퍼', 'pork_shoulder': '돼지 어깨살',
    'mussel': '홍합', 'golden_brown_sugar': '황설탕', 'spanish_onion': '스페인 양파',
    'dark_soy_sauce': '진간장', 'lard': '라드', 'pork_tenderloin': '돼지 안심',
    'lemon': '레몬', 'salt_&_freshly_ground_black_pepper': '소금과 후추',
    'rotisserie_cooked_chicken': '로티세리 치킨', 'grain_cereal': '곡물 시리얼',
    'verjus': '베르쥬', 'coconut_meat': '코코넛', 'unsalted_chicken_stock': '무염 치킨 스톡',
    'lemon_balm_leaf': '레몬밤', 'lemon_peel_strip': '레몬 껍질', 'granulated_yeast': '효모',
    'turkey_breast_half': '칠면조 가슴살', 'stone_ground_whole_wheat_flour': '통밀가루',
    'scotch': '스카치 위스키', 'bourbon': '버번 위스키', 'rye_whiskey': '라이 위스키',
    'irish_whiskey': '아이리시 위스키', 'scotch_whisky': '스카치 위스키',
    'bourbon_whiskey': '버번 위스키', 'jack_daniels_whiskey': '잭 다니엘 위스키',
    'cheese': '치즈', 'chicken': '닭고기', 'beef': '소고기', 'chocolate': '초콜릿',
    'coffee': '커피', 'apple': '사과', 'banana': '바나나', 'tomato': '토마토',
    'onion': '양파', 'garlic': '마늘', 'basil': '바질', 'olive_oil': '올리브 오일',
    'salt': '소금', 'pepper': '후추', 'butter': '버터', 'cream': '크림',
    'milk': '우유', 'egg': '계란', 'bread': '빵', 'rice': '쌀',
    'shortcrust_pastry': '쇼트크러스트 페이스트리', 'mushroom': '버섯', 'floury_potato': '감자'
  };

  return translations[englishName] || englishName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// 술 이름을 한글로 번역하는 함수
const translateLiquorName = (englishName) => {
  if (!englishName || typeof englishName !== 'string') {
    return '알 수 없음';
  }

  const translations = {
    'wine': '와인', 'red_wine': '레드 와인', 'white_wine': '화이트 와인',
    'whiskey': '위스키', 'whisky': '위스키', 'scotch': '스카치 위스키',
    'bourbon': '버번 위스키', 'rye_whiskey': '라이 위스키',
    'irish_whiskey': '아이리시 위스키', 'scotch_whisky': '스카치 위스키',
    'bourbon_whiskey': '버번 위스키', 'jack_daniels_whiskey': '잭 다니엘 위스키',
    'vodka': '보드카', 'gin': '진', 'rum': '럼', 'tequila': '데킬라',
    'beer': '맥주', 'ale': '에일', 'lager': '라거', 'stout': '스타우트',
    'sake': '사케', 'soju': '소주', 'makgeolli': '막걸리',
    'cognac': '코냑', 'brandy': '브랜디', 'armagnac': '아르마냑',
    'vermouth': '베르무트', 'champagne': '샴페인', 'prosecco': '프로세코',
    'port': '포트 와인', 'sherry': '셰리', 'madeira': '마데이라'
  };

  return translations[englishName] || englishName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// 점수 관련 함수들을 전역으로 이동
const getScoreOutOf100 = (score) => {
  if (!score || isNaN(score)) return 0;
  return Math.round(Math.max(0, Math.min(100, score)));
};

const getStarRating = (score) => {
  const normalizedScore = getScoreOutOf100(score);
  if (normalizedScore >= 90) return 5;
  if (normalizedScore >= 75) return 4;
  if (normalizedScore >= 60) return 3;
  if (normalizedScore >= 40) return 2;
  if (normalizedScore >= 20) return 1;
  return 0;
};

const getScoreDescription = (score) => {
  const normalizedScore = getScoreOutOf100(score);
  if (normalizedScore >= 90) return '매우 훌륭함';
  if (normalizedScore >= 75) return '훌륭함';
  if (normalizedScore >= 60) return '좋음';
  if (normalizedScore >= 40) return '보통';
  if (normalizedScore >= 20) return '아쉬움';
  return '매우 아쉬움';
};

const getScoreColor = (score) => {
  const normalizedScore = getScoreOutOf100(score);
  if (normalizedScore >= 90) return '#2e7d32';
  if (normalizedScore >= 75) return '#388e3c';
  if (normalizedScore >= 60) return '#689f38';
  if (normalizedScore >= 40) return '#f57c00';
  if (normalizedScore >= 20) return '#e64a19';
  return '#d32f2f';
};

function PairingPage() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const modeParam = queryParams.get('mode');

  // URL 파라미터에 따라 초기 탭 설정
  const getInitialTab = () => {
    if (modeParam === 'ingredient-recommendation') return 1;
    if (modeParam === 'liquor-recommendation') return 2;
    return 0;
  };

  const [tabValue, setTabValue] = useState(getInitialTab());
  const [koreanLiquor, setKoreanLiquor] = useState('');
  const [koreanIngredient, setKoreanIngredient] = useState('');
  const [pairingResults, setPairingResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('search');

  useEffect(() => {
    setTabValue(getInitialTab());
  }, [location.search]);

  const handleKoreanSearch = async () => {
    if (tabValue === 0) {
      if (!koreanLiquor || !koreanIngredient) {
        setError('주류와 재료를 모두 입력해주세요.');
        return;
      }
      
      try {
        setSearching(true);
        setError(null);
        const response = await koreanPairingService.predictPairing(koreanLiquor, koreanIngredient);
        console.log('Pairing prediction response:', response.data);
        setPairingResults(response.data);
        setActiveView('results');
        setSearching(false);
      } catch (err) {
        setError(err.message || '페어링 분석 중 오류가 발생했습니다.');
        setSearching(false);
      }
    } else if (tabValue === 1) {
      if (!koreanLiquor) {
        setError('주류를 입력해주세요.');
        return;
      }
      
      try {
        setSearching(true);
        setError(null);
        const response = await koreanPairingService.getRecommendations(koreanLiquor, 3);
        console.log('Ingredient recommendations response:', response.data);
        setPairingResults(response.data);
        setActiveView('results');
        setSearching(false);
      } catch (err) {
        setError(err.message || '재료 추천 중 오류가 발생했습니다.');
        setSearching(false);
      }
    } else if (tabValue === 2) {
      if (!koreanIngredient) {
        setError('재료를 입력해주세요.');
        return;
      }
      
      try {
        setSearching(true);
        setError(null);
        const response = await koreanPairingService.getLiquorRecommendations(koreanIngredient, 3);
        console.log('Liquor recommendations response:', response.data);
        setPairingResults(response.data);
        setActiveView('results');
        setSearching(false);
      } catch (err) {
        setError(err.message || '술 추천 중 오류가 발생했습니다.');
        setSearching(false);
      }
    }
  };

  const handleClearSearch = () => {
    setKoreanLiquor('');
    setKoreanIngredient('');
    setPairingResults(null);
    setError(null);
    setActiveView('search');
    navigate('/pairing');
  };

  const getIngredientName = (rec) => {
    const name = rec?.ingredient_name || rec?.ingredient || rec?.name;
    return name || '알 수 없음';
  };

  const getLiquorName = (rec) => {
    const name = rec?.liquor_name || rec?.liquor || rec?.name;
    return name || '알 수 없음';
  };

  return (
    <Box>
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Box sx={{ 
          py: 10, 
          background: `
            linear-gradient(135deg, 
              rgba(30, 30, 30, 0.75) 0%, 
              rgba(45, 35, 30, 0.8) 50%, 
              rgba(60, 45, 35, 0.75) 100%
            ),
            url('/images/wine-bg.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'white',
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
        }}>
          <Container maxWidth="lg">
            <Box textAlign="center" position="relative" zIndex={1}>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600, 
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '-0.01em',
                }}
              >
                완벽한 페어링 찾기
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 5, 
                  maxWidth: 700, 
                  mx: 'auto', 
                  lineHeight: 1.7,
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: { xs: '1rem', md: '1.2rem' },
                }}
              >
                좋아하는 주류나 음식을 입력하면 AI가 최적의 페어링을 추천해 드립니다.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tab label="페어링 분석" icon={<WineBarIcon />} iconPosition="start" sx={{ minHeight: 64, fontSize: '1.1rem' }} />
            <Tab label="재료 추천" icon={<RestaurantIcon />} iconPosition="start" sx={{ minHeight: 64, fontSize: '1.1rem' }} />
            <Tab label="술 추천" icon={<LocalBarIcon />} iconPosition="start" sx={{ minHeight: 64, fontSize: '1.1rem' }} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                주류와 재료의 페어링 점수를 분석합니다
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                두 가지를 모두 입력하시면 AI가 얼마나 잘 어울리는지 분석해드립니다.
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth label="주류" placeholder="예: 위스키, 와인, 맥주, 소주"
                  value={koreanLiquor} onChange={(e) => setKoreanLiquor(e.target.value)} disabled={searching}
                  InputProps={{ startAdornment: <WineBarIcon sx={{ mr: 1, color: 'primary.main' }} /> }}
                  sx={{ '& .MuiInputBase-root': { height: 64 } }}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth label="재료" placeholder="예: 치즈, 초콜릿, 고기, 해산물"
                  value={koreanIngredient} onChange={(e) => setKoreanIngredient(e.target.value)} disabled={searching}
                  InputProps={{ startAdornment: <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} /> }}
                  sx={{ '& .MuiInputBase-root': { height: 64 } }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained" fullWidth size="large" sx={{ height: 64 }}
                  onClick={handleKoreanSearch} disabled={searching || !koreanLiquor || !koreanIngredient}
                  startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
                >
                  {searching ? '분석 중...' : '분석하기'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                주류에 어울리는 재료를 추천합니다
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                좋아하는 주류를 입력하시면 AI가 가장 잘 어울리는 재료 3가지를 추천해드립니다.
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth label="주류" placeholder="예: 위스키, 와인, 맥주, 소주, 진, 럼"
                  value={koreanLiquor} onChange={(e) => setKoreanLiquor(e.target.value)} disabled={searching}
                  InputProps={{ startAdornment: <WineBarIcon sx={{ mr: 1, color: 'primary.main' }} /> }}
                  sx={{ '& .MuiInputBase-root': { height: 64 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained" fullWidth size="large" sx={{ height: 64 }}
                  onClick={handleKoreanSearch} disabled={searching || !koreanLiquor}
                  startIcon={searching ? <CircularProgress size={20} /> : <StarIcon />}
                >
                  {searching ? '추천 중...' : '추천받기'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                재료에 어울리는 술을 추천합니다
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                좋아하는 음식이나 재료를 입력하시면 AI가 가장 잘 어울리는 술 3가지를 추천해드립니다.
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth label="재료" placeholder="예: 치즈, 초콜릿, 스테이크, 해산물, 디저트"
                  value={koreanIngredient} onChange={(e) => setKoreanIngredient(e.target.value)} disabled={searching}
                  InputProps={{ startAdornment: <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} /> }}
                  sx={{ '& .MuiInputBase-root': { height: 64 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained" fullWidth size="large" sx={{ height: 64 }}
                  onClick={handleKoreanSearch} disabled={searching || !koreanIngredient}
                  startIcon={searching ? <CircularProgress size={20} /> : <LocalBarIcon />}
                >
                  {searching ? '추천 중...' : '추천받기'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        </Paper>

        {activeView === 'results' && pairingResults && (
          <Fade in={true}>
            <Box mt={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  {tabValue === 0 ? '페어링 분석 결과' : tabValue === 1 ? '재료 추천 결과' : '술 추천 결과'}
                </Typography>
                <Button variant="outlined" onClick={handleClearSearch} size="large">새 검색</Button>
              </Box>

              <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
                {tabValue === 0 ? (
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                        {pairingResults.korean_input?.liquor || koreanLiquor} + {pairingResults.korean_input?.ingredient || koreanIngredient}
                      </Typography>
                      {pairingResults.english_names && (
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          영어명: {pairingResults.english_names.liquor} + {pairingResults.english_names.ingredient}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Rating value={getStarRating(pairingResults.score)} readOnly sx={{ mr: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {getScoreOutOf100(pairingResults.score)}점 / 100점
                        </Typography>
                        <Chip 
                          label={getScoreDescription(pairingResults.score)}
                          sx={{ 
                            ml: 2, 
                            backgroundColor: getScoreColor(pairingResults.score),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                        {pairingResults.explanation || '이 조합에 대한 설명이 없습니다.'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ 
                        p: 3, 
                        backgroundColor: alpha(getScoreColor(pairingResults.score), 0.1), 
                        borderRadius: 2, 
                        textAlign: 'center',
                        border: `2px solid ${alpha(getScoreColor(pairingResults.score), 0.3)}`
                      }}>
                        <Typography variant="h6" gutterBottom>페어링 점수</Typography>
                        <Typography variant="h2" sx={{ 
                          fontWeight: 700, 
                          color: getScoreColor(pairingResults.score)
                        }}>
                          {getScoreOutOf100(pairingResults.score)}점
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {getScoreDescription(pairingResults.score)}
                        </Typography>
                        <Rating 
                          value={getStarRating(pairingResults.score)} 
                          readOnly 
                          sx={{ mt: 2 }}
                          size="large"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                ) : tabValue === 1 ? (
                  <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                      {translateLiquorName(pairingResults.liquor_name) || koreanLiquor} 추천 재료 TOP 3
                    </Typography>
                    
                    {pairingResults.overall_explanation && (
                      <Paper sx={{ p: 3, mb: 4, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>💡 전체 추천 설명</Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                          {pairingResults.overall_explanation}
                        </Typography>
                      </Paper>
                    )}

                    <Grid container spacing={3}>
                      {pairingResults.recommendations?.map((rec, index) => {
                        const ingredientName = getIngredientName(rec);
                        const score = getScoreOutOf100(rec.score);
                        return (
                          <Grid item xs={12} md={4} key={index}>
                            <Card sx={{ 
                              p: 3, height: '100%',
                              transition: 'transform 0.2s, elevation 0.2s',
                              '&:hover': { transform: 'translateY(-4px)', elevation: 8 },
                              border: `2px solid ${alpha(getScoreColor(score), 0.2)}`
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5" sx={{ 
                                  fontWeight: 700, 
                                  color: getScoreColor(score), 
                                  mr: 1, 
                                  minWidth: 32 
                                }}>
                                  #{index + 1}
                                </Typography>
                                <RestaurantIcon sx={{ mr: 1, color: getScoreColor(score) }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {translateIngredientName(ingredientName)}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                영어명: {ingredientName}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Rating value={getStarRating(score)} readOnly size="small" sx={{ mr: 1 }} />
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {score}점
                                </Typography>
                                <Chip 
                                  label={getScoreDescription(score)}
                                  size="small"
                                  sx={{ 
                                    ml: 1,
                                    backgroundColor: getScoreColor(score),
                                    color: 'white',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </Box>

                              {rec.explanation && (
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                  {rec.explanation}
                                </Typography>
                              )}
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>

                    {/* 막대 그래프 추가 */}
                    {pairingResults.recommendations && pairingResults.recommendations.length > 0 && (
                      <PairingScoreChart 
                        recommendations={pairingResults.recommendations} 
                        title="재료별 페어링 점수 비교"
                        tabValue={1}
                      />
                    )}

                    {(!pairingResults.recommendations || pairingResults.recommendations.length === 0) && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">추천 결과가 없습니다.</Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                      {translateIngredientName(pairingResults.ingredient_name) || koreanIngredient} 추천 술 TOP 3
                    </Typography>
                    
                    {pairingResults.overall_explanation && (
                      <Paper sx={{ p: 3, mb: 4, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>💡 전체 추천 설명</Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                          {pairingResults.overall_explanation}
                        </Typography>
                      </Paper>
                    )}

                    <Grid container spacing={3}>
                      {pairingResults.recommendations?.map((rec, index) => {
                        const liquorName = getLiquorName(rec);
                        const score = getScoreOutOf100(rec.score);
                        return (
                          <Grid item xs={12} md={4} key={index}>
                            <Card sx={{ 
                              p: 3, height: '100%',
                              transition: 'transform 0.2s, elevation 0.2s',
                              '&:hover': { transform: 'translateY(-4px)', elevation: 8 },
                              border: `2px solid ${alpha(getScoreColor(score), 0.2)}`
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5" sx={{ 
                                  fontWeight: 700, 
                                  color: getScoreColor(score), 
                                  mr: 1, 
                                  minWidth: 32 
                                }}>
                                  #{index + 1}
                                </Typography>
                                <LocalBarIcon sx={{ mr: 1, color: getScoreColor(score) }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {translateLiquorName(liquorName)}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                영어명: {liquorName}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Rating value={getStarRating(score)} readOnly size="small" sx={{ mr: 1 }} />
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {score}점
                                </Typography>
                                <Chip 
                                  label={getScoreDescription(score)}
                                  size="small"
                                  sx={{ 
                                    ml: 1,
                                    backgroundColor: getScoreColor(score),
                                    color: 'white',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </Box>

                              {rec.explanation && (
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                  {rec.explanation}
                                </Typography>
                              )}
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>

                    {/* 막대 그래프 추가 */}
                    {pairingResults.recommendations && pairingResults.recommendations.length > 0 && (
                      <PairingScoreChart 
                        recommendations={pairingResults.recommendations} 
                        title="주류별 페어링 점수 비교"
                        tabValue={2}
                      />
                    )}

                    {(!pairingResults.recommendations || pairingResults.recommendations.length === 0) && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">추천 결과가 없습니다.</Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
}

export default PairingPage;