import { Router } from 'express';
import multer from 'multer';
import { db } from '../config';
import { uploadFile, getPublicUrl } from '../services/storage';
import fs from 'fs';
import { promisify } from 'util';
import * as admin from 'firebase-admin';

const unlinkAsync = promisify(fs.unlink);

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Get all creator profiles
router.get('/creators', async (req, res, next) => {
  try {
    const snapshot = await db.collection('creators').get();
    const creators = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(creators);
  } catch (error) {
    next(error);
  }
});

// Get a specific creator profile
router.get('/creators/:creatorId', async (req, res, next) => {
  try {
    const doc = await db.collection('creators').doc(req.params.creatorId).get();
    if (!doc.exists) {
      return res.status(404).send({ error: 'Creator not found' });
    }
    res.send({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

// Create a creator profile
router.post('/creators', async (req, res, next) => {
  try {
    const { userId, portfolio, skills, rating } = req.body;
    if (!userId) {
      return res.status(400).send({ error: 'userId is required' });
    }
    await db.collection('creators').doc(userId).set({
      portfolio: portfolio || [],
      skills: skills || [],
      rating: rating || 0,
    });
    res.send({ id: userId, message: 'Creator profile created successfully' });
  } catch (error) {
    next(error);
  }
});

// Upload portfolio file
router.post('/creators/:creatorId/portfolio', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send({ error: 'File is required' });
  }

  try {
    const { creatorId } = req.params;
    const fileName = `${creatorId}/${req.file.originalname}`;
    await uploadFile(req.file.path, fileName);
    await unlinkAsync(req.file.path); // Delete local file after upload

    const publicUrl = getPublicUrl(fileName);

    // Update creator's portfolio in Firestore
    const creatorRef = db.collection('creators').doc(creatorId);
    await creatorRef.update({
      portfolio: admin.firestore.FieldValue.arrayUnion(publicUrl),
    });

    res.send({ url: publicUrl, message: 'File uploaded successfully' });
  } catch (error) {
    next(error);
  }
});

// Submit a review for a creator
router.post('/creators/:creatorId/reviews', async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const { userId, rating, review } = req.body;
    if (!userId || !rating || !review) {
      return res.status(400).send({ error: 'userId, rating, and review are required' });
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
    const reviewsSnapshot = await db.collection('reviews').where('creatorId', '==', creatorId).get();
    let totalRating = 0;
    reviewsSnapshot.docs.forEach(doc => {
      totalRating += doc.data().rating;
    });
    const averageRating = totalRating / reviewsSnapshot.size;

    await db.collection('creators').doc(creatorId).update({ rating: averageRating });

    res.send({ message: 'Review submitted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get all listings
router.get('/listings', async (req, res, next) => {
  try {
    const snapshot = await db.collection('listings').get();
    const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(listings);
  } catch (error) {
    next(error);
  }
});

// Create a new listing
router.post('/listings', async (req, res, next) => {
  try {
    const { creatorId, title, description, price } = req.body;
    if (!creatorId || !title || !description || !price) {
      return res.status(400).send({ error: 'creatorId, title, description, and price are required' });
    }
    const docRef = await db.collection('listings').add({
      creatorId,
      title,
      description,
      price,
      createdAt: new Date(),
    });
    res.send({ id: docRef.id, message: 'Listing created successfully' });
  } catch (error) {
    next(error);
  }
});

// Get a specific listing
router.get('/listings/:listingId', async (req, res, next) => {
  try {
    const doc = await db.collection('listings').doc(req.params.listingId).get();
    if (!doc.exists) {
      return res.status(404).send({ error: 'Listing not found' });
    }
    res.send({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

// Create a new transaction
router.post('/transactions', async (req, res, next) => {
  try {
    const { listingId, buyerId, amount } = req.body;
    if (!listingId || !buyerId || !amount) {
      return res.status(400).send({ error: 'listingId, buyerId, and amount are required' });
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

    res.send({ id: docRef.id, message: 'Transaction initiated. Awaiting payment processing.' });
  } catch (error) {
    next(error);
  }
});

export default router;
