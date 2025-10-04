import { Request, Response, NextFunction } from 'express';
export declare function firebaseAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
