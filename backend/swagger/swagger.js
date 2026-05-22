const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Campus Lost & Found API',
      description: 'REST API for the Campus Lost and Found System.',
      contact: {
        name: 'ItemHunters',
      },
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Development server' },
      { url: 'https://campus-lost-and-found-system-be.vercel.app/api/v1', description: 'Production server' },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
          description:  'Paste your access token from POST /auth/login',
        },
      },

      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code:    { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Email is required' },
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id:       { type: 'string', example: '663a9f12b4e2c1' },
            name:      { type: 'string', example: 'Juan dela Cruz' },
            email:     { type: 'string', example: 'juan@example.com' },
            role:      { type: 'string', enum: ['student','admin'] },
            createdAt: { type: 'string', format: 'date-time' },
          }
        },
        Item: {
          type: 'object',
          properties: {
            _id:           { type: 'string' },
            type:          { type: 'string', enum: ['lost','found'] },
            name:          { type: 'string', example: 'Blue ASUS Laptop' },
            description:   { type: 'string' },
            category:      { type: 'string', enum: ['electronics','clothing','documents','accessories','bags','keys','other'] },
            location:      { type: 'string', example: 'Library 2F' },
            status:        { type: 'string', enum: ['pending','approved','recovered','archived'] },
            imageUrls:     { type: 'array', items: { type: 'string' } },
            dateLostFound: { type: 'string', format: 'date' },
            reportedBy:    { type: 'string' },
            createdAt:     { type: 'string', format: 'date-time' },
          }
        },
        Claim: {
          type: 'object',
          properties: {
            _id:                 { type: 'string' },
            itemId:              { type: 'string' },
            claimantId:          { type: 'string' },
            message:             { type: 'string' },
            status:              { type: 'string', enum: ['pending','approved','rejected'] },
            verificationAnswers: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' } } } },
            adminNote:           { type: 'string' },
            resolvedAt:          { type: 'string', format: 'date-time' },
          }
        },
      }
    },
    security: [{ bearerAuth: [] }],  
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js')],  
};

module.exports = swaggerJsdoc(options);
