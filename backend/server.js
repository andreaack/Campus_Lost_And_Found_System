require('express-async-errors');  // MUST be first require
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const swaggerUi    = require('swagger-ui-express');
const swaggerSpec  = require('./swagger/swagger');
const connectDB    = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes   = require('./routes/auth');
const userRoutes   = require('./routes/users');
const itemRoutes   = require('./routes/items');
const claimRoutes  = require('./routes/claims');

const app = express();

// ─── CORS & Parsers (MUST be before any routes) ─────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Security Middleware ───────────────────────────────────
app.use(helmet());

// Connect to MongoDB
connectDB();

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Stricter rate limit on auth: 10 attempts per 15 min
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/v1/auth/login', authLimiter);

// ─── Logging ──────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Swagger Docs ─────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Campus LAF API',
  swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
}));

// ─── Health Check ─────────────────────────────────────────
app.get('/', (req, res) => res.send('API is Online'));
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────
app.use('/api/v1/auth',   authRoutes);
app.use('/api/v1/users',  userRoutes);
app.use('/api/v1/items',  itemRoutes);
app.use('/api/v1/claims', claimRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` } });
});

// ─── Global Error Handler (MUST be last) ─────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Graceful port conflict handling
const startServer = (port) => {
  const portNum = parseInt(port, 10);
  const server = app.listen(portNum, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${portNum}`);
    console.log(`Swagger docs: http://localhost:${portNum}/api-docs`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${portNum} is already in use, trying ${portNum + 1}...`);
      startServer(portNum + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
  return server;
};

const server = startServer(PORT);

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app; 
