import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config';
import { validate, userValidationRules, loginValidationRules } from '../middleware/validation';
import AppError from '../utils/AppError';

const router = Router();

// User Registration
router.post('/register', validate(userValidationRules), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
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
    const token = jwt.sign({ userId: newUserRef.id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1h' });

    res.status(201).send({ message: 'User registered successfully', token });
  } catch (error) {
    next(error);
  }
});

// User Login
router.post('/login', validate(loginValidationRules), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
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
    const token = jwt.sign({ userId: userDoc.id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1h' });

    res.send({ message: 'Logged in successfully', token });
  } catch (error) {
    next(error);
  }
});

export default router;
