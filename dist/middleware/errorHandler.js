"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err,
        });
    }
    else {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
            // Programming or other unknown error: don't leak error details
        }
        else {
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    }
    next();
};
exports.errorHandler = errorHandler;
