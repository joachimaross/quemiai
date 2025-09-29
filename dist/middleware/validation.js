"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewValidationRules = exports.transactionValidationRules = exports.schedulePostValidationRules = exports.postValidationRules = exports.loginValidationRules = exports.userValidationRules = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        res.status(400).json({ errors: errors.array() });
    };
};
exports.validate = validate;
exports.userValidationRules = [
    (0, express_validator_1.body)('username')
        .optional()
        .notEmpty()
        .withMessage('Username cannot be empty'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Invalid email address'),
    (0, express_validator_1.body)('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('profilePicture')
        .optional()
        .isURL()
        .withMessage('Profile picture must be a valid URL'),
    (0, express_validator_1.body)('bannerPicture')
        .optional()
        .isURL()
        .withMessage('Banner picture must be a valid URL'),
    (0, express_validator_1.body)('bio').optional().isString().withMessage('Bio must be a string'),
    (0, express_validator_1.body)('location')
        .optional()
        .isString()
        .withMessage('Location must be a string'),
    (0, express_validator_1.body)('externalLinks')
        .optional()
        .isArray()
        .withMessage('External links must be an array'),
    (0, express_validator_1.body)('externalLinks.*.type')
        .optional()
        .isString()
        .withMessage('External link type must be a string'),
    (0, express_validator_1.body)('externalLinks.*.url')
        .optional()
        .isURL()
        .withMessage('External link URL must be a valid URL'),
    (0, express_validator_1.body)('privacySettings')
        .optional()
        .isObject()
        .withMessage('Privacy settings must be an object'),
    (0, express_validator_1.body)('privacySettings.profileVisibility')
        .optional()
        .isIn(['public', 'private', 'followers'])
        .withMessage('Invalid profile visibility setting'),
    (0, express_validator_1.body)('privacySettings.messagePermissions')
        .optional()
        .isIn(['all', 'followers', 'none'])
        .withMessage('Invalid message permissions setting'),
];
exports.loginValidationRules = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
exports.postValidationRules = [
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
    (0, express_validator_1.body)('media').optional().isArray().withMessage('Media must be an array'),
    (0, express_validator_1.body)('media.*.url')
        .optional()
        .isURL()
        .withMessage('Each media item URL must be a valid URL'),
    (0, express_validator_1.body)('media.*.alt')
        .optional()
        .isString()
        .withMessage('Each media item alt text must be a string'),
    (0, express_validator_1.body)('platform')
        .optional()
        .isString()
        .withMessage('Platform must be a string'),
];
exports.schedulePostValidationRules = [
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
    (0, express_validator_1.body)('scheduledTime').isISO8601().withMessage('Invalid scheduled time'),
    (0, express_validator_1.body)('platform').notEmpty().withMessage('Platform is required'),
];
exports.transactionValidationRules = [
    (0, express_validator_1.body)('listingId').notEmpty().withMessage('Listing ID is required'),
    (0, express_validator_1.body)('buyerId').notEmpty().withMessage('Buyer ID is required'),
    (0, express_validator_1.body)('amount')
        .isFloat({ gt: 0 })
        .withMessage('Amount must be a positive number'),
];
exports.reviewValidationRules = [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('User ID is required'),
    (0, express_validator_1.body)('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('review').notEmpty().withMessage('Review is required'),
];
