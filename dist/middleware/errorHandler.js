"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    let errorResponse = {
        status: err.status,
        message: err.message,
    };
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
        errorResponse = {
            ...errorResponse,
            stack: err.stack,
            error: err,
        };
        res.status(err.statusCode).json(errorResponse);
    }
    else {
        if (err.isOperational) {
            res.status(err.statusCode).json(errorResponse);
        }
        else {
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    }
};
exports.errorHandler = errorHandler;
