import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';

interface FirebaseUser {
  uid: string;
  email?: string;
  [key: string]: unknown;
}

interface AuthenticatedRequest extends Request {
  user?: FirebaseUser;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
}
