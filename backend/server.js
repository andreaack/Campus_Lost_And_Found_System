require('express-async-errors'); 
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

=
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Campus LAF API',
  swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
}));

app.use(helmet({
  contentSecurityPolicy: false, 
}));

connectDB();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Skip rate limiting for Swagger UI
app.use('/api-docs', (req, res, next) => next());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/v1/auth/login', authLimiter);


if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.get('/', (req, res) => res.send('API is Online'));
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});


app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});


app.use('/api/v1/auth',   authRoutes);
app.use('/api/v1/users',  userRoutes);
app.use('/api/v1/items',  itemRoutes);
app.use('/api/v1/claims', claimRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` } });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

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


process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app; 
