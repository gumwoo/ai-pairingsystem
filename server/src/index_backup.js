const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/error');
const { accessLogger, errorLogger, developmentLogger } = require('./middleware/logger');

// Import routes
const pairingRoutes = require('./routes/pairing');
const userRoutes = require('./routes/user');
const ingredientRoutes = require('./routes/ingredient');
const liquorRoutes = require('./routes/liquor');
const compoundRoutes = require('./routes/compound');
const edgeRoutes = require('./routes/edge');
const preferenceRoutes = require('./routes/preference');
const recommendationRoutes = require('./routes/recommendation');
const adminRoutes = require('./routes/admin');
const debugRoutes = require('./routes/debug'); // 디버그 라우트 추가

// Import database connection and initialization
const db = require('./config/db');
// Import Swagger setup
const setupSwagger = require('./config/swagger');
// Initialize express app
const app = express();
const PORT = process.env.PORT || 5004;

// CORS 설정 업데이트
app.use(cors({
  origin: 'http://localhost:3004', // 프론트엔드 주소
  credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(accessLogger);
  app.use(errorLogger);
} else {
  app.use(developmentLogger);
}

// Connect to MySQL and initialize database if needed
db.connectDB()
  .then(() => {
    console.log('MySQL connected');
    return db.initializeDB();
  })
  .then(() => {
    console.log('Database initialization checked');
  })
  .catch(err => console.error('MySQL setup error:', err));

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!require('fs').existsSync(logsDir)) {
  require('fs').mkdirSync(logsDir, { recursive: true });
}
// Swagger UI 설정
setupSwagger(app);
// Routes
app.use('/api/pairing', pairingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/liquors', liquorRoutes);
app.use('/api/compounds', compoundRoutes);
app.use('/api/edges', edgeRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/debug', debugRoutes); // 디버그 라우트 등록

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI Pairing System API' });
});

// Error handling middleware (should be after all routes)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: `Route not found: ${req.originalUrl}` 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

module.exports = app;