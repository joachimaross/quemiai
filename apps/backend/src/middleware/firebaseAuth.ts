import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';

export async function firebaseAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await firebaseAuth().verifyIdToken(idToken);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = decodedToken;
    return next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
}
