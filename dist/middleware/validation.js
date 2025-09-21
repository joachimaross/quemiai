"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewValidationRules = exports.transactionValidationRules = exports.schedulePostValidationRules = exports.postValidationRules = exports.userValidationRules = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (validations) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        for (let validation of validations) {
            const result = yield validation.run(req);
            if (result.errors.length)
                break;
        }
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        res.status(400).json({ errors: errors.array() });
    });
};
exports.validate = validate;
exports.userValidationRules = [
    (0, express_validator_1.body)('username').notEmpty().withMessage('Username is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address'),
];
exports.postValidationRules = [
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
];
exports.schedulePostValidationRules = [
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
    (0, express_validator_1.body)('scheduledTime').isISO8601().withMessage('Invalid scheduled time'),
    (0, express_validator_1.body)('platform').notEmpty().withMessage('Platform is required'),
];
exports.transactionValidationRules = [
    (0, express_validator_1.body)('listingId').notEmpty().withMessage('Listing ID is required'),
    (0, express_validator_1.body)('buyerId').notEmpty().withMessage('Buyer ID is required'),
    (0, express_validator_1.body)('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
];
exports.reviewValidationRules = [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('User ID is required'),
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('review').notEmpty().withMessage('Review is required'),
];
