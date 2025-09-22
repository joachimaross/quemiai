"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
router.get('/creators', (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const snapshot = yield config_1.db.collection('creators').get();
        const creators = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.send(creators);
    }
    catch (error) {
        next(error);
    }
}));
// Get a specific creator profile
router.get('/creators/:creatorId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield config_1.db.collection('creators').doc(req.params.creatorId).get();
        if (!doc.exists) {
            next(new AppError_1.default('Creator not found', 404));
            return;
        }
        res.send(Object.assign({ id: doc.id }, doc.data()));
    }
    catch (error) {
        next(error);
    }
}));
// Create a creator profile
router.post('/creators', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, portfolio, skills, rating } = req.body;
        if (!userId) {
            next(new AppError_1.default('userId is required', 400));
            return;
        }
        yield config_1.db
            .collection('creators')
            .doc(userId)
            .set({
            portfolio: portfolio || [],
            skills: skills || [],
            rating: rating || 0,
        });
        res.status(201).send({ id: userId, message: 'Creator profile created successfully' });
    }
    catch (error) {
        next(error);
    }
}));
// Upload portfolio file
router.post('/creators/:creatorId/portfolio', upload.single('file'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        next(new AppError_1.default('File is required', 400));
        return;
    }
    try {
        const { creatorId } = req.params;
        const fileName = `${creatorId}/${req.file.originalname}`;
        yield (0, storage_1.uploadBuffer)(req.file.buffer, fileName);
        const publicUrl = (0, storage_1.getPublicUrl)(fileName);
        // Update creator's portfolio in Firestore
        const creatorRef = config_1.db.collection('creators').doc(creatorId);
        yield creatorRef.update({
            portfolio: firestore_1.FieldValue.arrayUnion(publicUrl),
        });
        res.send({ url: publicUrl, message: 'File uploaded successfully' });
    }
    catch (error) {
        next(error);
    }
}));
// Submit a review for a creator
router.post('/creators/:creatorId/reviews', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { creatorId } = req.params;
        const { userId, rating, review } = req.body;
        if (!userId || !rating || !review) {
            next(new AppError_1.default('userId, rating, and review are required', 400));
            return;
        }
        // Add review to Firestore
        yield config_1.db.collection('reviews').add({
            creatorId,
            userId,
            rating,
            review,
            createdAt: new Date(),
        });
        // Update creator's average rating
        const reviewsSnapshot = yield config_1.db
            .collection('reviews')
            .where('creatorId', '==', creatorId)
            .get();
        let totalRating = 0;
        reviewsSnapshot.docs.forEach((doc) => {
            totalRating += doc.data().rating;
        });
        const averageRating = totalRating / reviewsSnapshot.size;
        yield config_1.db.collection('creators').doc(creatorId).update({ rating: averageRating });
        res.status(201).send({ message: 'Review submitted successfully' });
    }
    catch (error) {
        next(error);
    }
}));
// Get all listings
router.get('/listings', (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const snapshot = yield config_1.db.collection('listings').get();
        const listings = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.send(listings);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new listing
router.post('/listings', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { creatorId, title, description, price } = req.body;
        if (!creatorId || !title || !description || !price) {
            next(new AppError_1.default('creatorId, title, description, and price are required', 400));
            return;
        }
        const docRef = yield config_1.db.collection('listings').add({
            creatorId,
            title,
            description,
            price,
            createdAt: new Date(),
        });
        res.status(201).send({ id: docRef.id, message: 'Listing created successfully' });
    }
    catch (error) {
        next(error);
    }
}));
// Get a specific listing
router.get('/listings/:listingId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield config_1.db.collection('listings').doc(req.params.listingId).get();
        if (!doc.exists) {
            next(new AppError_1.default('Listing not found', 404));
            return;
        }
        res.send(Object.assign({ id: doc.id }, doc.data()));
    }
    catch (error) {
        next(error);
    }
}));
// Create a new transaction
router.post('/transactions', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { listingId, buyerId, amount } = req.body;
        if (!listingId || !buyerId || !amount) {
            next(new AppError_1.default('listingId, buyerId, and amount are required', 400));
            return;
        }
        // In a real application, this would trigger a Cloud Function
        // to handle payment processing with a payment gateway (e.g., Stripe)
        const docRef = yield config_1.db.collection('transactions').add({
            listingId,
            buyerId,
            amount,
            status: 'pending',
            createdAt: new Date(),
        });
        res
            .status(201)
            .send({ id: docRef.id, message: 'Transaction initiated. Awaiting payment processing.' });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
