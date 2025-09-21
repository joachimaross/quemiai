import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (let validation of validations) {
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
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email address'),
];

export const postValidationRules = [
  body('content').notEmpty().withMessage('Content is required'),
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
