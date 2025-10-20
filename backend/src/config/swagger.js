
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your MERN App API',
      version: '1.0.0',
      description: 'API documentation for the MERN application',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://helagovi-lk.onrender.com/api' 
          : 'http://localhost:5001/api',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/**/*.js'], // Path to route files
};

const specs = swaggerJsDoc(options);

module.exports = { swaggerUi, specs };