"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.errorHandler = void 0;
var errorHandler = function (err, _req, res, _next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    var errorResponse = {
        status: err.status,
        message: err.message
    };
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
        errorResponse = __assign(__assign({}, errorResponse), { stack: err.stack, error: err });
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
                message: 'Something went very wrong!'
            });
        }
    }
};
exports.errorHandler = errorHandler;
