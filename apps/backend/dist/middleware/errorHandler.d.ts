import { Request, Response, NextFunction } from 'express';
interface ErrorWithStatus extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}
export declare const errorHandler: (err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => void;
export {};
