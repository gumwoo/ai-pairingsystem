import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  TextField,
  InputAdornment,
  IconButton,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab,
  Paper,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { getIngredients, searchIngredients, getIngredientsByCategory, getCategories } from '../services/api';

function IngredientPage() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);
  const [favorites, setFavorites] = useState([]);
  
  const limit = 12; // Items per page
  
  useEffect(() => {
    // Load categories first
    fetchCategories();
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteIngredients');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);
  
  useEffect(() => {
    fetchIngredients();
  }, [page, selectedCategory]);
  
  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      // Add 'all' as the first option
      setCategories(['all', ...response.data]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // Mock categories for demonstration
      setCategories([
        'all',
        'Fruits',
        'Vegetables',
        'Herbs',
        'Spices',
        'Dairy',
        'Nuts',
        'Meats',
        'Desserts',
        'Beverages'
      ]);
    }
  };
  
  const fetchIngredients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      // If there's a search query, use search endpoint
      if (searchQuery.trim()) {
        response = await searchIngredients(searchQuery);
        setIngredients(response.data);
        setTotalPages(1); // Search results are not paginated in this simplified version
      } 
      // If a specific category is selected
      else if (selectedCategory !== 'all') {
        response = await getIngredientsByCategory(selectedCategory);
        setIngredients(response.data);
        setTotalPages(Math.ceil(response.total / limit) || 1);
      } 
      // Otherwise fetch all paginated ingredients
      else {
        response = await getIngredients(page, limit);
        setIngredients(response.data);
        setTotalPages(response.pages);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      setError('Failed to fetch ingredients. Please try again.');
      
      // Mock data for demonstration
      setIngredients([
        {
          ingredient_id: 1,
          name: 'Apple',
          category: 'Fruits',
          description: 'Crisp and sweet fruit with varieties ranging from sweet to tart.',
          flavor_profile: ['Sweet', 'Tart', 'Crisp'],
          image_url: '/images/apple.jpg'
        },
        {
          ingredient_id: 2,
          name: 'Lemon',
          category: 'Fruits',
          description: 'Sour citrus fruit with bright, acidic flavor.',
          flavor_profile: ['Sour', 'Acidic', 'Bright', 'Citrus'],
          image_url: '/images/lemon.jpg'
        },
        {
          ingredient_id: 3,
          name: 'Cinnamon',
          category: 'Spices',
          description: 'Warm, sweet spice from tree bark, used in both sweet and savory dishes.',
          flavor_profile: ['Warm', 'Sweet', 'Woody', 'Spicy'],
          image_url: '/images/cinnamon.jpg'
        },
        {
          ingredient_id: 4,
          name: 'Vanilla',
          category: 'Spices',
          description: 'Sweet, floral flavor from vanilla bean pods.',
          flavor_profile: ['Sweet', 'Floral', 'Creamy'],
          image_url: '/images/vanilla.jpg'
        },
        {
          ingredient_id: 5,
          name: 'Dark Chocolate',
          category: 'Desserts',
          description: 'Rich, bittersweet chocolate with high cocoa content.',
          flavor_profile: ['Bitter', 'Sweet', 'Rich', 'Complex'],
          image_url: '/images/chocolate.jpg'
        },
        {
          ingredient_id: 6,
          name: 'Basil',
          category: 'Herbs',
          description: 'Aromatic herb with sweet, peppery flavor.',
          flavor_profile: ['Sweet', 'Peppery', 'Aromatic'],
          image_url: '/images/basil.jpg'
        }
      ]);
      setTotalPages(3); // Mock 3 pages
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchIngredients();
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    setPage(1); // Reset to first page
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    fetchIngredients();
  };
  
  const toggleFavorite = (ingredientId) => {
    const newFavorites = favorites.includes(ingredientId)
      ? favorites.filter(id => id !== ingredientId)
      : [...favorites, ingredientId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteIngredients', JSON.stringify(newFavorites));
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" gutterBottom sx={{ mt: 4 }}>
        재료 탐색
      </Typography>
      <Typography variant="subtitle1" align="center" paragraph sx={{ mb: 4 }}>
        좋아하는 주류와 페어링할 음식과 재료를 발견해보세요
      </Typography>

      {/* Search Bar */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <TextField
          label="재료 검색"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Category Tabs */}
      <Paper sx={{ mb: 4 }}>
        

<Tabs
  value={selectedCategory}
  onChange={handleCategoryChange}
  variant="scrollable"
  scrollButtons="auto"
  aria-label="ingredient categories"
  sx={{ 
    borderBottom: 1, 
    borderColor: 'divider',
    '& .MuiTab-root': {
      color: '#000000',
    },
    '& .Mui-selected': {
      color: '#E5C989', // 선택된 탭은 primary 색상 유지
    }
  }}
>
  {categories.map((category) => (
    <Tab 
      key={category} 
      value={category} 
      label={category === 'all' ? '모든 카테고리' : category} 
      sx={{ textTransform: 'capitalize', color: '#000000' }}
    />
  ))}
</Tabs>
      </Paper>

      {/* Active filters */}
      {searchQuery && (
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={`검색: ${searchQuery}`} 
            onDelete={clearSearch}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Results Grid */}
          {ingredients.length > 0 ? (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {ingredients.map((ingredient) => (
                <Grid item key={ingredient.ingredient_id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: '0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardActionArea 
                      component={RouterLink}
                      to={`/ingredients/${ingredient.ingredient_id}`}
                      sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={ingredient.image_url || 'https://via.placeholder.com/300x140?text=No+Image'}
                        alt={ingredient.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
  <Typography gutterBottom variant="h6" component="div" sx={{ color: '#000000' }}>
    {ingredient.name}
  </Typography>
  
  {ingredient.category && (
    <Typography variant="body2" sx={{ color: '#000000' }} gutterBottom>
      카테고리: {ingredient.category}
    </Typography>
  )}
  
  <Typography variant="body2" sx={{ color: '#000000' }}>
    {ingredient.description ? 
      (ingredient.description.length > 100 
        ? `${ingredient.description.substring(0, 100)}...` 
        : ingredient.description) 
      : '설명이 없습니다.'
    }
  </Typography>
  
  {ingredient.flavor_profile && ingredient.flavor_profile.length > 0 && (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" sx={{ mb: 1, color: '#000000' }}>
        플레이버 프로파일:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {ingredient.flavor_profile.map((flavor, index) => (
          <Chip 
            key={index} 
            label={flavor} 
            size="small" 
            color="secondary" 
            variant="outlined"
            sx={{ color: '#000000', borderColor: '#000000' }}
          />
        ))}
      </Box>
    </Box>
  )}
</CardContent>
                    </CardActionArea>
                    
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        bgcolor: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(ingredient.ingredient_id);
                      }}
                    >
                      {favorites.includes(ingredient.ingredient_id) ? (
                        <FavoriteIcon color="error" />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box 
              sx={{ 
                my: 4, 
                py: 6, 
                textAlign: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2
              }}
            >
              <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                재료를 찾을 수 없습니다
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                검색 기준을 조정하거나 다른 카테고리를 탐색해보세요.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setPage(1);
                  fetchIngredients();
                }}
              >
                모든 재료 보기
              </Button>
            </Box>
          )}
          
          {/* Pagination */}
          {ingredients.length > 0 && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default IngredientPage;
