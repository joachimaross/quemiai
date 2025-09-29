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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLabelsInVideo = void 0;
var video_intelligence_1 = require("@google-cloud/video-intelligence");
var protos_1 = require("@google-cloud/video-intelligence/build/protos/protos");
var videoClient = new video_intelligence_1.VideoIntelligenceServiceClient();
var Feature = protos_1.google.cloud.videointelligence.v1.Feature;
var detectLabelsInVideo = function (gcsUri) { return __awaiter(void 0, void 0, void 0, function () {
    var request, operation, operationResult, annotations, shotLabels;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                request = {
                    inputUri: gcsUri,
                    features: [Feature.LABEL_DETECTION],
                };
                return [4 /*yield*/, videoClient.annotateVideo(request)];
            case 1:
                operation = (_c.sent())[0];
                console.log('Waiting for operation to complete...');
                return [4 /*yield*/, operation.promise()];
            case 2:
                operationResult = (_c.sent())[0];
                annotations = (_a = operationResult.annotationResults) === null || _a === void 0 ? void 0 : _a[0];
                shotLabels = (_b = annotations === null || annotations === void 0 ? void 0 : annotations.shotLabelAnnotations) === null || _b === void 0 ? void 0 : _b.map(function (shotLabel) {
                    var _a, _b;
                    return __spreadArray([
                        (_a = shotLabel.entity) === null || _a === void 0 ? void 0 : _a.description
                    ], (((_b = shotLabel.categoryEntities) === null || _b === void 0 ? void 0 : _b.map(function (cat) { return cat.description; })) || []), true);
                }).flat().filter(function (description) { return !!description; });
                return [2 /*return*/, shotLabels];
        }
    });
}); };
exports.detectLabelsInVideo = detectLabelsInVideo;
