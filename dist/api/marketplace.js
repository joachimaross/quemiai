"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../config");
const multer_1 = __importDefault(require("multer"));
const storage_1 = require("../services/storage");
const firestore_1 = require("firebase-admin/firestore");
const AppError_1 = __importDefault(require("../utils/AppError"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Get all creator profiles
router.get('/creators', async (_req, res, next) => {
    try {
        const snapshot = await config_1.db.collection('creators').get();
        const creators = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return res.send(creators);
    }
    catch (error) {
        return next(error);
    }
});
// Get a specific creator profile
router.get('/creators/:creatorId', async (req, res, next) => {
    try {
        const doc = await config_1.db.collection('creators').doc(req.params.creatorId).get();
        if (!doc.exists) {
            return next(new AppError_1.default('Creator not found', 404));
        }
        return res.send(Object.assign({ id: doc.id }, doc.data()));
    }
    catch (error) {
        return next(error);
    }
});
// Create a creator profile
router.post('/creators', async (req, res, next) => {
    try {
        const { userId, portfolio, skills, rating } = req.body;
        if (!userId) {
            return next(new AppError_1.default('userId is required', 400));
        }
        await config_1.db
            .collection('creators')
            .doc(userId)
            .set({
            portfolio: portfolio || [],
            skills: skills || [],
            rating: rating || 0,
        });
        return res.status(201).send({ id: userId, message: 'Creator profile created successfully' });
    }
    catch (error) {
        return next(error);
    }
});
// Upload portfolio file
router.post('/creators/:creatorId/portfolio', upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return next(new AppError_1.default('File is required', 400));
    }
    try {
        const { creatorId } = req.params;
        const fileName = `${creatorId}/${req.file.originalname}`;
        await (0, storage_1.uploadBuffer)(req.file.buffer, fileName);
        const publicUrl = (0, storage_1.getPublicUrl)(fileName);
        // Update creator's portfolio in Firestore
        const creatorRef = config_1.db.collection('creators').doc(creatorId);
        await creatorRef.update({
            portfolio: firestore_1.FieldValue.arrayUnion(publicUrl),
        });
        return res.send({ url: publicUrl, message: 'File uploaded successfully' });
    }
    catch (error) {
        return next(error);
    }
});
// Submit a review for a creator
router.post('/creators/:creatorId/reviews', async (req, res, next) => {
    try {
        const { creatorId } = req.params;
        const { userId, rating, review } = req.body;
        if (!userId || !rating || !review) {
            return next(new AppError_1.default('userId, rating, and review are required', 400));
        }
        // Add review to Firestore
        await config_1.db.collection('reviews').add({
            creatorId,
            userId,
            rating,
            review,
            createdAt: new Date(),
        });
        // Update creator's average rating
        const reviewsSnapshot = await config_1.db
            .collection('reviews')
            .where('creatorId', '==', creatorId)
            .get();
        let totalRating = 0;
        reviewsSnapshot.docs.forEach((doc) => {
            totalRating += doc.data().rating;
        });
        const averageRating = totalRating / reviewsSnapshot.size;
        await config_1.db.collection('creators').doc(creatorId).update({ rating: averageRating });
        return res.status(201).send({ message: 'Review submitted successfully' });
    }
    catch (error) {
        return next(error);
    }
});
// Get all listings
router.get('/listings', async (_req, res, next) => {
    try {
        const snapshot = await config_1.db.collection('listings').get();
        const listings = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return res.send(listings);
    }
    catch (error) {
        return next(error);
    }
});
// Create a new listing
router.post('/listings', async (req, res, next) => {
    try {
        const { creatorId, title, description, price } = req.body;
        if (!creatorId || !title || !description || !price) {
            return next(new AppError_1.default('creatorId, title, description, and price are required', 400));
        }
        const docRef = await config_1.db.collection('listings').add({
            creatorId,
            title,
            description,
            price,
            createdAt: new Date(),
        });
        return res.status(201).send({ id: docRef.id, message: 'Listing created successfully' });
    }
    catch (error) {
        return next(error);
    }
});
// Get a specific listing
router.get('/listings/:listingId', async (req, res, next) => {
    try {
        const doc = await config_1.db.collection('listings').doc(req.params.listingId).get();
        if (!doc.exists) {
            return next(new AppError_1.default('Listing not found', 404));
        }
        return res.send(Object.assign({ id: doc.id }, doc.data()));
    }
    catch (error) {
        return next(error);
    }
});
// Create a new transaction
router.post('/transactions', async (req, res, next) => {
    try {
        const { listingId, buyerId, amount } = req.body;
        if (!listingId || !buyerId || !amount) {
            return next(new AppError_1.default('listingId, buyerId, and amount are required', 400));
        }
        // In a real application, this would trigger a Cloud Function
        // to handle payment processing with a payment gateway (e.g., Stripe)
        const docRef = await config_1.db.collection('transactions').add({
            listingId,
            buyerId,
            amount,
            status: 'pending', // Status would be updated by the Cloud Function
            createdAt: new Date(),
        });
        return res
            .status(201)
            .send({ id: docRef.id, message: 'Transaction initiated. Awaiting payment processing.' });
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
