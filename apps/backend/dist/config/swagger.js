"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
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
    apis: ['./src/api/*.ts', './src/middleware/*.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
//# sourceMappingURL=swagger.js.map