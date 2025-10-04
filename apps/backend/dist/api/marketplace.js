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
router.get('/creators', async (_req, res, next) => {
    try {
        const snapshot = await config_1.db.collection('creators').get();
        const creators = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return res.send(creators);
    }
    catch (error) {
        return next(error);
    }
});
router.get('/creators/:creatorId', async (req, res, next) => {
    try {
        const doc = await config_1.db.collection('creators').doc(req.params.creatorId).get();
        if (!doc.exists) {
            return next(new AppError_1.default('Creator not found', 404));
        }
        return res.send({ id: doc.id, ...doc.data() });
    }
    catch (error) {
        return next(error);
    }
});
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
router.post('/creators/:creatorId/portfolio', upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return next(new AppError_1.default('File is required', 400));
    }
    try {
        const { creatorId } = req.params;
        const fileName = `${creatorId}/${req.file.originalname}`;
        await (0, storage_1.uploadBuffer)(req.file.buffer, fileName);
        const publicUrl = (0, storage_1.getPublicUrl)(fileName);
        const creatorRef = config_1.db.collection('creators').doc(creatorId);
        await creatorRef.update({
            portfolio: firestore_1.FieldValue.arrayUnion(publicUrl),
        });
        return res.send({
            url: publicUrl,
            message: 'File uploaded successfully',
        });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/creators/:creatorId/reviews', async (req, res, next) => {
    try {
        const { creatorId } = req.params;
        const { userId, rating, review } = req.body;
        if (!userId || !rating || !review) {
            return next(new AppError_1.default('userId, rating, and review are required', 400));
        }
        await config_1.db.collection('reviews').add({
            creatorId,
            userId,
            rating,
            review,
            createdAt: new Date(),
        });
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
router.get('/listings', async (_req, res, next) => {
    try {
        const snapshot = await config_1.db.collection('listings').get();
        const listings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return res.send(listings);
    }
    catch (error) {
        return next(error);
    }
});
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
router.get('/listings/:listingId', async (req, res, next) => {
    try {
        const doc = await config_1.db.collection('listings').doc(req.params.listingId).get();
        if (!doc.exists) {
            return next(new AppError_1.default('Listing not found', 404));
        }
        return res.send({ id: doc.id, ...doc.data() });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/transactions', async (req, res, next) => {
    try {
        const { listingId, buyerId, amount } = req.body;
        if (!listingId || !buyerId || !amount) {
            return next(new AppError_1.default('listingId, buyerId, and amount are required', 400));
        }
        const docRef = await config_1.db.collection('transactions').add({
            listingId,
            buyerId,
            amount,
            status: 'pending',
            createdAt: new Date(),
        });
        return res.status(201).send({
            id: docRef.id,
            message: 'Transaction initiated. Awaiting payment processing.',
        });
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
//# sourceMappingURL=marketplace.js.map