import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { db } from '../config';
import {
  validate,
  userValidationRules,
  loginValidationRules,
} from '../middleware/validation';
import AppError from '../utils/AppError';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 minlength: 6
 *                 description: User's password (min 6 characters)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Bad request (e.g., user already exists, invalid input)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User with that email already exists.
 *       500:
 *         description: Server error
 */
// User Registration
router.post(
  '/register',
  validate(userValidationRules),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Check if user already exists
      const userSnapshot = await db
        .collection('users')
        .where('email', '==', email)
        .get();
      if (!userSnapshot.empty) {
        return next(new AppError('User with that email already exists.', 400));
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Store user in Firestore
      const newUserRef = await db.collection('users').add({
        email,
        password: hashedPassword,
        createdAt: new Date(),
      });

      // Generate JWT (for immediate login after registration)
      const token = jwt.sign(
        { userId: newUserRef.id },
        process.env.JWT_SECRET || 'supersecretkey',
        {
          expiresIn: '1h',
        },
      );

      return res
        .status(201)
        .send({ message: 'User registered successfully', token });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged in successfully
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Bad request (e.g., invalid credentials)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials.
 *       500:
 *         description: Server error
 */
// User Login
router.post(
  '/login',
  validate(loginValidationRules),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const userSnapshot = await db
        .collection('users')
        .where('email', '==', email)
        .get();
      if (userSnapshot.empty) {
        return next(new AppError('Invalid credentials.', 400));
      }

      const userDoc = userSnapshot.docs[0];
      const user = userDoc.data();

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next(new AppError('Invalid credentials.', 400));
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: userDoc.id },
        process.env.JWT_SECRET || 'supersecretkey',
        {
          expiresIn: '1h',
        },
      );

      return res.send({ message: 'Logged in successfully', token });
    } catch (error) {
      return next(error);
    }
  },
);

// Protected route example (requires Firebase Auth)
import { firebaseAuthMiddleware } from '../middleware/firebaseAuth';
router.get(
  '/me',
  firebaseAuthMiddleware,
  async (req: Request, res: Response) => {
    // The decoded Firebase user is available as req.user
    res.json({ user: (req as any).user });
  },
);

export default router;
