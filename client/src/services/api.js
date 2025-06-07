import axios from 'axios';

// Create an axios instance with default configs
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5004/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add interceptor to handle auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

// API endpoints for liquors
export const getLiquors = async (page = 1, limit = 20) => {
  try {
    return await API.get(`/liquors?page=${page}&limit=${limit}`);
  } catch (error) {
    console.error('Error fetching liquors:', error);
    throw error;
  }
};

export const getLiquorById = async (id) => {
  try {
    return await API.get(`/liquors/${id}`);
  } catch (error) {
    console.error(`Error fetching liquor with ID ${id}:`, error);
    throw error;
  }
};

export const searchLiquors = async (query) => {
  try {
    return await API.get(`/liquors/search/${query}`);
  } catch (error) {
    console.error('Error searching liquors:', error);
    throw error;
  }
};

// API endpoints for ingredients
export const getIngredients = async (page = 1, limit = 20) => {
  try {
    return await API.get(`/ingredients?page=${page}&limit=${limit}`);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    throw error;
  }
};

export const getIngredientById = async (id) => {
  try {
    return await API.get(`/ingredients/${id}`);
  } catch (error) {
    console.error(`Error fetching ingredient with ID ${id}:`, error);
    throw error;
  }
};

export const searchIngredients = async (query) => {
  try {
    return await API.get(`/ingredients/search/${query}`);
  } catch (error) {
    console.error('Error searching ingredients:', error);
    throw error;
  }
};

export const getIngredientsByCategory = async (category) => {
  try {
    return await API.get(`/ingredients/category/${category}`);
  } catch (error) {
    console.error(`Error fetching ingredients by category ${category}:`, error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    return await API.get('/ingredients/categories');
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// API endpoints for pairings
export const getPairingScore = async (liquorId, ingredientId) => {
  try {
    return await API.get(`/pairing/score/${liquorId}/${ingredientId}`);
  } catch (error) {
    console.error(`Error fetching pairing score for liquor ${liquorId} and ingredient ${ingredientId}:`, error);
    throw error;
  }
};

export const getRecommendations = async (liquorId, limit = 10) => {
  try {
    return await API.get(`/pairing/recommendations/${liquorId}?limit=${limit}`);
  } catch (error) {
    console.error(`Error fetching recommendations for liquor ${liquorId}:`, error);
    throw error;
  }
};

export const getPairingExplanation = async (liquorId, ingredientId) => {
  try {
    return await API.get(`/pairing/explanation/${liquorId}/${ingredientId}`);
  } catch (error) {
    console.error(`Error fetching explanation for liquor ${liquorId} and ingredient ${ingredientId}:`, error);
    throw error;
  }
};

export const getTopPairings = async (limit = 10) => {
  try {
    return await API.get(`/pairing/top?limit=${limit}`);
  } catch (error) {
    console.error('Error fetching top pairings:', error);
    throw error;
  }
};

export const ratePairing = async (pairingId, rating) => {
  try {
    return await API.post(`/pairing/rate/${pairingId}`, { rating });
  } catch (error) {
    console.error(`Error rating pairing ${pairingId}:`, error);
    throw error;
  }
};

// API endpoints for users (authentication)
export const registerUser = async (userData) => {
  try {
    return await API.post('/users/register', userData);
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    return await API.post('/users/login', credentials);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    return await API.get('/users/me');
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    return await API.put('/users/profile', userData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateUserPreferences = async (preferences) => {
  try {
    return await API.put('/users/preferences', preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export default API;