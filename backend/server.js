require('express-async-errors'); 
require('dotenv').config();

const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const swaggerSpec  = require('./swagger/swagger');
const connectDB    = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes   = require('./routes/auth');
const userRoutes   = require('./routes/users');
const itemRoutes   = require('./routes/items');
const claimRoutes  = require('./routes/claims');

const app = express();

// Connect to MongoDB
connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));


app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", "'unsafe-inline'", "unpkg.com", "cdn.jsdelivr.net"],
        styleSrc:    ["'self'", "'unsafe-inline'", "unpkg.com", "cdn.jsdelivr.net", "fonts.googleapis.com"],
        fontSrc:     ["'self'", "fonts.gstatic.com", "data:"],
        imgSrc:      ["'self'", "data:", "validator.swagger.io"],
        connectSrc:  ["'self'", "*.vercel.app", "localhost:*"],
      },
    },
  })
);

app.use(cors({
  origin: '*',
  credentials: true,
}));

// Trust proxy for Vercel deployment
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/v1/auth/login', authLimiter);

// ─── Parsers ───────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));


app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});



app.get('/api-docs', (req, res) => {
  const host    = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const specUrl  = `${protocol}://${host}/api-docs.json`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Campus Lost & Found API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    <style>
      body { margin: 0; padding: 0; }
      #swagger-ui { max-width: 100%; margin: 0; padding: 0; }
      .topbar .download-url-wrapper { display: none !important; }
      .topbar .link { display: none !important; }
      .swagger-ui .topbar .download-url-wrapper { display: none !important; }
      .swagger-ui .topbar .link { display: none !important; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        SwaggerUIBundle({
          url:           "${specUrl}",
          dom_id:        "#swagger-ui",
          presets:       [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout:        "StandaloneLayout",
          persistAuthorization: true,
          displayRequestDuration: true,
          tryItOutEnabled: true,
          filter: false,
          deepLinking: true,
        });
      };
    </script>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// ─── Health Check ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message:   'Campus Lost & Found API is running',
    status:    'ok',
    env:       process.env.NODE_ENV,
    docs:      '/api-docs',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    res.json({
      status: state === 1 ? 'ok' : 'degraded',
      env: process.env.NODE_ENV,
      db: statusMap[state] || 'unknown',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});


app.use('/api/v1/auth',   authRoutes);
app.use('/api/v1/users',  userRoutes);
app.use('/api/v1/items',  itemRoutes);
app.use('/api/v1/claims', claimRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` },
  });
});


app.use(errorHandler);


if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI:   http://localhost:${PORT}/api-docs`);
    console.log(`Swagger JSON: http://localhost:${PORT}/api-docs.json`);
  });
}

module.exports = app; 
