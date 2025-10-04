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
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("../config/swagger"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.get('/', (_req, res) => {
    res.send('Welcome to the Zeeky Social App API! Your pulse on real content.');
});
app.use(express_1.default.json());
app.use('/api/v1', api_1.default);
app.use(errorHandler_1.errorHandler);
exports.handler = (0, serverless_http_1.default)(app);
exports.default = app;
//# sourceMappingURL=api.js.map