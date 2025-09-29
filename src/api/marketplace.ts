import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../config';
import multer from 'multer';
import { uploadBuffer, getPublicUrl } from '../services/storage';
import { FieldValue } from 'firebase-admin/firestore';
import AppError from '../utils/AppError';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all creator profiles
router.get(
  '/creators',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const snapshot = await db.collection('creators').get();
      const creators = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.send(creators);
    } catch (error) {
      return next(error);
    }
  },
);

// Get a specific creator profile
router.get(
  '/creators/:creatorId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doc = await db
        .collection('creators')
        .doc(req.params.creatorId)
        .get();
      if (!doc.exists) {
        return next(new AppError('Creator not found', 404));
      }
      return res.send({ id: doc.id, ...doc.data() });
    } catch (error) {
      return next(error);
    }
  },
);

// Create a creator profile
router.post(
  '/creators',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, portfolio, skills, rating } = req.body;
      if (!userId) {
        return next(new AppError('userId is required', 400));
      }
      await db
        .collection('creators')
        .doc(userId)
        .set({
          portfolio: portfolio || [],
          skills: skills || [],
          rating: rating || 0,
        });
      return res
        .status(201)
        .send({ id: userId, message: 'Creator profile created successfully' });
    } catch (error) {
      return next(error);
    }
  },
);

// Upload portfolio file
router.post(
  '/creators/:creatorId/portfolio',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('File is required', 400));
    }

    try {
      const { creatorId } = req.params;
      const fileName = `${creatorId}/${req.file.originalname}`;
      await uploadBuffer(req.file.buffer, fileName);

      const publicUrl = getPublicUrl(fileName);

      // Update creator's portfolio in Firestore
      const creatorRef = db.collection('creators').doc(creatorId);
      await creatorRef.update({
        portfolio: FieldValue.arrayUnion(publicUrl),
      });

      return res.send({
        url: publicUrl,
        message: 'File uploaded successfully',
      });
    } catch (error) {
      return next(error);
    }
  },
);

// Submit a review for a creator
router.post(
  '/creators/:creatorId/reviews',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { creatorId } = req.params;
      const { userId, rating, review } = req.body;
      if (!userId || !rating || !review) {
        return next(
          new AppError('userId, rating, and review are required', 400),
        );
      }

      // Add review to Firestore
      await db.collection('reviews').add({
        creatorId,
        userId,
        rating,
        review,
        createdAt: new Date(),
      });

      // Update creator's average rating
      const reviewsSnapshot = await db
        .collection('reviews')
        .where('creatorId', '==', creatorId)
        .get();
      let totalRating = 0;
      reviewsSnapshot.docs.forEach((doc) => {
        totalRating += doc.data().rating;
      });
      const averageRating = totalRating / reviewsSnapshot.size;

      await db
        .collection('creators')
        .doc(creatorId)
        .update({ rating: averageRating });

      return res.status(201).send({ message: 'Review submitted successfully' });
    } catch (error) {
      return next(error);
    }
  },
);

// Get all listings
router.get(
  '/listings',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const snapshot = await db.collection('listings').get();
      const listings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.send(listings);
    } catch (error) {
      return next(error);
    }
  },
);

// Create a new listing
router.post(
  '/listings',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { creatorId, title, description, price } = req.body;
      if (!creatorId || !title || !description || !price) {
        return next(
          new AppError(
            'creatorId, title, description, and price are required',
            400,
          ),
        );
      }
      const docRef = await db.collection('listings').add({
        creatorId,
        title,
        description,
        price,
        createdAt: new Date(),
      });
      return res
        .status(201)
        .send({ id: docRef.id, message: 'Listing created successfully' });
    } catch (error) {
      return next(error);
    }
  },
);

// Get a specific listing
router.get(
  '/listings/:listingId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doc = await db
        .collection('listings')
        .doc(req.params.listingId)
        .get();
      if (!doc.exists) {
        return next(new AppError('Listing not found', 404));
      }
      return res.send({ id: doc.id, ...doc.data() });
    } catch (error) {
      return next(error);
    }
  },
);

// Create a new transaction
router.post(
  '/transactions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { listingId, buyerId, amount } = req.body;
      if (!listingId || !buyerId || !amount) {
        return next(
          new AppError('listingId, buyerId, and amount are required', 400),
        );
      }

      // In a real application, this would trigger a Cloud Function
      // to handle payment processing with a payment gateway (e.g., Stripe)
      const docRef = await db.collection('transactions').add({
        listingId,
        buyerId,
        amount,
        status: 'pending', // Status would be updated by the Cloud Function
        createdAt: new Date(),
      });

      return res.status(201).send({
        id: docRef.id,
        message: 'Transaction initiated. Awaiting payment processing.',
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
