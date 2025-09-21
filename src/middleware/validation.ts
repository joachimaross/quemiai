import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

export const userValidationRules = [
  body('username').optional().notEmpty().withMessage('Username cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),
  body('bannerPicture').optional().isURL().withMessage('Banner picture must be a valid URL'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
  body('location').optional().isString().withMessage('Location must be a string'),
  body('externalLinks').optional().isArray().withMessage('External links must be an array'),
  body('externalLinks.*.type')
    .optional()
    .isString()
    .withMessage('External link type must be a string'),
  body('externalLinks.*.url')
    .optional()
    .isURL()
    .withMessage('External link URL must be a valid URL'),
  body('privacySettings').optional().isObject().withMessage('Privacy settings must be an object'),
  body('privacySettings.profileVisibility')
    .optional()
    .isIn(['public', 'private', 'followers'])
    .withMessage('Invalid profile visibility setting'),
  body('privacySettings.messagePermissions')
    .optional()
    .isIn(['all', 'followers', 'none'])
    .withMessage('Invalid message permissions setting'),
];

export const loginValidationRules = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const postValidationRules = [
  body('content').notEmpty().withMessage('Content is required'),
  body('media').optional().isArray().withMessage('Media must be an array'),
  body('media.*.url').optional().isURL().withMessage('Each media item URL must be a valid URL'),
  body('media.*.alt')
    .optional()
    .isString()
    .withMessage('Each media item alt text must be a string'),
  body('platform').optional().isString().withMessage('Platform must be a string'),
];

export const schedulePostValidationRules = [
  body('content').notEmpty().withMessage('Content is required'),
  body('scheduledTime').isISO8601().withMessage('Invalid scheduled time'),
  body('platform').notEmpty().withMessage('Platform is required'),
];

export const transactionValidationRules = [
  body('listingId').notEmpty().withMessage('Listing ID is required'),
  body('buyerId').notEmpty().withMessage('Buyer ID is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
];

export const reviewValidationRules = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').notEmpty().withMessage('Review is required'),
];
