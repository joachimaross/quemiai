import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quemi Social Messaging API',
      version: '1.0.0',
      description: 'API documentation for the Quemi social messaging platform (migrated from Netlify to Vercel).',
    },
    servers: [
      {
        url: 'https://quemiai.vercel.app/api/v1',
        description: 'Production (Vercel)',
      },
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Local Development (Next.js dev server)',
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
  // Adjust these globs if API/middleware paths move during broader migration.
  apis: ['./src/api/*.ts', './src/middleware/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;