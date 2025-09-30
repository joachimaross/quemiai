import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { DecodedIdToken } from 'firebase-admin/auth';

// Extend Express Request interface
interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
}

export async function firebaseAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await firebaseAuth().verifyIdToken(idToken);
    (req as AuthenticatedRequest).user = decodedToken;
    return next();
  } catch (_error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
}
