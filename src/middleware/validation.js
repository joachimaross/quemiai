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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.reviewValidationRules = exports.transactionValidationRules = exports.schedulePostValidationRules = exports.postValidationRules = exports.loginValidationRules = exports.userValidationRules = exports.validate = void 0;
var express_validator_1 = require("express-validator");
var validate = function (validations) {
    return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var errors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(validations.map(function (validation) { return validation.run(req); }))];
                case 1:
                    _a.sent();
                    errors = (0, express_validator_1.validationResult)(req);
                    if (errors.isEmpty()) {
                        return [2 /*return*/, next()];
                    }
                    res.status(400).json({ errors: errors.array() });
                    return [2 /*return*/];
            }
        });
    }); };
};
exports.validate = validate;
exports.userValidationRules = [
    (0, express_validator_1.body)('username').optional().notEmpty().withMessage('Username cannot be empty'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Invalid email address'),
    (0, express_validator_1.body)('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),
    (0, express_validator_1.body)('bannerPicture').optional().isURL().withMessage('Banner picture must be a valid URL'),
    (0, express_validator_1.body)('bio').optional().isString().withMessage('Bio must be a string'),
    (0, express_validator_1.body)('location').optional().isString().withMessage('Location must be a string'),
    (0, express_validator_1.body)('externalLinks').optional().isArray().withMessage('External links must be an array'),
    (0, express_validator_1.body)('externalLinks.*.type')
        .optional()
        .isString()
        .withMessage('External link type must be a string'),
    (0, express_validator_1.body)('externalLinks.*.url')
        .optional()
        .isURL()
        .withMessage('External link URL must be a valid URL'),
    (0, express_validator_1.body)('privacySettings').optional().isObject().withMessage('Privacy settings must be an object'),
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
    (0, express_validator_1.body)('media.*.url').optional().isURL().withMessage('Each media item URL must be a valid URL'),
    (0, express_validator_1.body)('media.*.alt')
        .optional()
        .isString()
        .withMessage('Each media item alt text must be a string'),
    (0, express_validator_1.body)('platform').optional().isString().withMessage('Platform must be a string'),
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
