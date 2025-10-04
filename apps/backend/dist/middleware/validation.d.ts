import { ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
export declare const validate: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const userValidationRules: ValidationChain[];
export declare const loginValidationRules: ValidationChain[];
export declare const postValidationRules: ValidationChain[];
export declare const schedulePostValidationRules: ValidationChain[];
export declare const transactionValidationRules: ValidationChain[];
export declare const reviewValidationRules: ValidationChain[];
