"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pino_1 = require("pino");
var logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty', // For development readability
        options: {
            colorize: true,
        },
    },
    // Add more fields for structured logging
    base: {
        pid: process.pid,
        environment: process.env.NODE_ENV,
    },
    timestamp: function () { return ",\"time\":\"".concat(new Date().toISOString(), "\""); },
});
exports.default = logger;
