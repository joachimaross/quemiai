"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const api_1 = __importDefault(require("../api"));
const errorHandler_1 = require("../middleware/errorHandler");
const app = (0, express_1.default)();
app.get('/.netlify/functions/api', (req, res) => {
    res.send('Welcome to the Joachima Social App API! Visit /api/v1 for the main API routes.');
});
app.use(express_1.default.json());
app.use('/.netlify/functions/api/v1', api_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
exports.handler = (0, serverless_http_1.default)(app);
