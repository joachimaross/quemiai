import { Router, NextFunction } from 'express';
import { db } from '../config';
import multer from 'multer';
import { uploadBuffer, getPublicUrl } from '../services/storage';
import { FieldValue } from 'firebase-admin/firestore';
import AppError from '../utils/AppError';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all creator profiles
router.get('/creators', async (_req, res, next: NextFunction) => {
  try {
    const snapshot = await db.collection('creators').get();
    const creators = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.send(creators);
  } catch (error) {
    next(error);
  }
});

// Get a specific creator profile
router.get('/creators/:creatorId', async (req, res, next: NextFunction) => {
  try {
    const doc = await db.collection('creators').doc(req.params.creatorId).get();
    if (!doc.exists) {
      next(new AppError('Creator not found', 404));
      return;
    }
    res.send({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

// Create a creator profile
router.post('/creators', async (req, res, next: NextFunction) => {
  try {
    const { userId, portfolio, skills, rating } = req.body;
    if (!userId) {
      next(new AppError('userId is required', 400));
      return;
    }
    await db
      .collection('creators')
      .doc(userId)
      .set({
        portfolio: portfolio || [],
        skills: skills || [],
        rating: rating || 0,
      });
    res.status(201).send({ id: userId, message: 'Creator profile created successfully' });
  } catch (error) {
    next(error);
  }
});

// Upload portfolio file
router.post(
  '/creators/:creatorId/portfolio',
  upload.single('file'),
  async (req, res, next: NextFunction) => {
    if (!req.file) {
      next(new AppError('File is required', 400));
      return;
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

      res.send({ url: publicUrl, message: 'File uploaded successfully' });
    } catch (error) {
      next(error);
    }
  },
);

// Submit a review for a creator
router.post('/creators/:creatorId/reviews', async (req, res, next: NextFunction) => {
  try {
    const { creatorId } = req.params;
    const { userId, rating, review } = req.body;
    if (!userId || !rating || !review) {
      next(new AppError('userId, rating, and review are required', 400));
      return;
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

    await db.collection('creators').doc(creatorId).update({ rating: averageRating });

    res.status(201).send({ message: 'Review submitted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get all listings
router.get('/listings', async (_req, res, next: NextFunction) => {
  try {
    const snapshot = await db.collection('listings').get();
    const listings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.send(listings);
  } catch (error) {
    next(error);
  }
});

// Create a new listing
router.post('/listings', async (req, res, next: NextFunction) => {
  try {
    const { creatorId, title, description, price } = req.body;
    if (!creatorId || !title || !description || !price) {
      next(new AppError('creatorId, title, description, and price are required', 400));
      return;
    }
    const docRef = await db.collection('listings').add({
      creatorId,
      title,
      description,
      price,
      createdAt: new Date(),
    });
    res.status(201).send({ id: docRef.id, message: 'Listing created successfully' });
  } catch (error) {
    next(error);
  }
});

// Get a specific listing
router.get('/listings/:listingId', async (req, res, next: NextFunction) => {
  try {
    const doc = await db.collection('listings').doc(req.params.listingId).get();
    if (!doc.exists) {
      next(new AppError('Listing not found', 404));
      return;
    }
    res.send({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

// Create a new transaction
router.post('/transactions', async (req, res, next: NextFunction) => {
  try {
    const { listingId, buyerId, amount } = req.body;
    if (!listingId || !buyerId || !amount) {
      next(new AppError('listingId, buyerId, and amount are required', 400));
      return;
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

    res
      .status(201)
      .send({ id: docRef.id, message: 'Transaction initiated. Awaiting payment processing.' });
  } catch (error) {
    next(error);
  }
});

export default router;
