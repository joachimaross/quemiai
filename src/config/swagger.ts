import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Joachima Social Media Super App API',
      version: '1.0.0',
      description: 'API documentation for the Joachima Social Media Super App',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Netlify Function API',
      },
      {
        url: 'http://localhost:8888/.netlify/functions/api/v1',
        description: 'Local Development API',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/api/*.ts', './src/middleware/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
