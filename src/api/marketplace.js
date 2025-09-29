"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var config_1 = require("../config");
var multer_1 = require("multer");
var storage_1 = require("../services/storage");
var firestore_1 = require("firebase-admin/firestore");
var AppError_1 = require("../utils/AppError");
var router = (0, express_1.Router)();
var upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Get all creator profiles
router.get('/creators', function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var snapshot, creators, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, config_1.db.collection('creators').get()];
            case 1:
                snapshot = _a.sent();
                creators = snapshot.docs.map(function (doc) { return (__assign({ id: doc.id }, doc.data())); });
                return [2 /*return*/, res.send(creators)];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, next(error_1)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get a specific creator profile
router.get('/creators/:creatorId', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var doc, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, config_1.db.collection('creators').doc(req.params.creatorId).get()];
            case 1:
                doc = _a.sent();
                if (!doc.exists) {
                    return [2 /*return*/, next(new AppError_1.default('Creator not found', 404))];
                }
                return [2 /*return*/, res.send(__assign({ id: doc.id }, doc.data()))];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, next(error_2)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Create a creator profile
router.post('/creators', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, portfolio, skills, rating, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, userId = _a.userId, portfolio = _a.portfolio, skills = _a.skills, rating = _a.rating;
                if (!userId) {
                    return [2 /*return*/, next(new AppError_1.default('userId is required', 400))];
                }
                return [4 /*yield*/, config_1.db
                        .collection('creators')
                        .doc(userId)
                        .set({
                        portfolio: portfolio || [],
                        skills: skills || [],
                        rating: rating || 0,
                    })];
            case 1:
                _b.sent();
                return [2 /*return*/, res.status(201).send({ id: userId, message: 'Creator profile created successfully' })];
            case 2:
                error_3 = _b.sent();
                return [2 /*return*/, next(error_3)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Upload portfolio file
router.post('/creators/:creatorId/portfolio', upload.single('file'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var creatorId, fileName, publicUrl, creatorRef, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.file) {
                    return [2 /*return*/, next(new AppError_1.default('File is required', 400))];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                creatorId = req.params.creatorId;
                fileName = "".concat(creatorId, "/").concat(req.file.originalname);
                return [4 /*yield*/, (0, storage_1.uploadBuffer)(req.file.buffer, fileName)];
            case 2:
                _a.sent();
                publicUrl = (0, storage_1.getPublicUrl)(fileName);
                creatorRef = config_1.db.collection('creators').doc(creatorId);
                return [4 /*yield*/, creatorRef.update({
                        portfolio: firestore_1.FieldValue.arrayUnion(publicUrl),
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/, res.send({ url: publicUrl, message: 'File uploaded successfully' })];
            case 4:
                error_4 = _a.sent();
                return [2 /*return*/, next(error_4)];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Submit a review for a creator
router.post('/creators/:creatorId/reviews', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var creatorId, _a, userId, rating, review, reviewsSnapshot, totalRating_1, averageRating, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                creatorId = req.params.creatorId;
                _a = req.body, userId = _a.userId, rating = _a.rating, review = _a.review;
                if (!userId || !rating || !review) {
                    return [2 /*return*/, next(new AppError_1.default('userId, rating, and review are required', 400))];
                }
                // Add review to Firestore
                return [4 /*yield*/, config_1.db.collection('reviews').add({
                        creatorId: creatorId,
                        userId: userId,
                        rating: rating,
                        review: review,
                        createdAt: new Date(),
                    })];
            case 1:
                // Add review to Firestore
                _b.sent();
                return [4 /*yield*/, config_1.db
                        .collection('reviews')
                        .where('creatorId', '==', creatorId)
                        .get()];
            case 2:
                reviewsSnapshot = _b.sent();
                totalRating_1 = 0;
                reviewsSnapshot.docs.forEach(function (doc) {
                    totalRating_1 += doc.data().rating;
                });
                averageRating = totalRating_1 / reviewsSnapshot.size;
                return [4 /*yield*/, config_1.db.collection('creators').doc(creatorId).update({ rating: averageRating })];
            case 3:
                _b.sent();
                return [2 /*return*/, res.status(201).send({ message: 'Review submitted successfully' })];
            case 4:
                error_5 = _b.sent();
                return [2 /*return*/, next(error_5)];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Get all listings
router.get('/listings', function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var snapshot, listings, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, config_1.db.collection('listings').get()];
            case 1:
                snapshot = _a.sent();
                listings = snapshot.docs.map(function (doc) { return (__assign({ id: doc.id }, doc.data())); });
                return [2 /*return*/, res.send(listings)];
            case 2:
                error_6 = _a.sent();
                return [2 /*return*/, next(error_6)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Create a new listing
router.post('/listings', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, creatorId, title, description, price, docRef, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, creatorId = _a.creatorId, title = _a.title, description = _a.description, price = _a.price;
                if (!creatorId || !title || !description || !price) {
                    return [2 /*return*/, next(new AppError_1.default('creatorId, title, description, and price are required', 400))];
                }
                return [4 /*yield*/, config_1.db.collection('listings').add({
                        creatorId: creatorId,
                        title: title,
                        description: description,
                        price: price,
                        createdAt: new Date(),
                    })];
            case 1:
                docRef = _b.sent();
                return [2 /*return*/, res.status(201).send({ id: docRef.id, message: 'Listing created successfully' })];
            case 2:
                error_7 = _b.sent();
                return [2 /*return*/, next(error_7)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get a specific listing
router.get('/listings/:listingId', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var doc, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, config_1.db.collection('listings').doc(req.params.listingId).get()];
            case 1:
                doc = _a.sent();
                if (!doc.exists) {
                    return [2 /*return*/, next(new AppError_1.default('Listing not found', 404))];
                }
                return [2 /*return*/, res.send(__assign({ id: doc.id }, doc.data()))];
            case 2:
                error_8 = _a.sent();
                return [2 /*return*/, next(error_8)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Create a new transaction
router.post('/transactions', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, listingId, buyerId, amount, docRef, error_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, listingId = _a.listingId, buyerId = _a.buyerId, amount = _a.amount;
                if (!listingId || !buyerId || !amount) {
                    return [2 /*return*/, next(new AppError_1.default('listingId, buyerId, and amount are required', 400))];
                }
                return [4 /*yield*/, config_1.db.collection('transactions').add({
                        listingId: listingId,
                        buyerId: buyerId,
                        amount: amount,
                        status: 'pending', // Status would be updated by the Cloud Function
                        createdAt: new Date(),
                    })];
            case 1:
                docRef = _b.sent();
                return [2 /*return*/, res
                        .status(201)
                        .send({ id: docRef.id, message: 'Transaction initiated. Awaiting payment processing.' })];
            case 2:
                error_9 = _b.sent();
                return [2 /*return*/, next(error_9)];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
