"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var express_1 = require("express");
var serverless_http_1 = require("serverless-http");
var api_1 = require("../api");
var errorHandler_1 = require("../middleware/errorHandler");
var helmet_1 = require("helmet");
var cors_1 = require("cors");
var swagger_ui_express_1 = require("swagger-ui-express");
var swagger_1 = require("../config/swagger");
var app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)());
// CORS Configuration
var corsOptions = {
    origin: '*', // Allow all origins for now
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
// Swagger API Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.get('/', function (_req, res) {
    res.send('Welcome to the Zeeky Social App API! Your pulse on real content.');
});
app.use(express_1.default.json());
app.use('/api/v1', api_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
exports.handler = (0, serverless_http_1.default)(app);
exports.default = app; // For testing purposes
