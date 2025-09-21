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
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLabelsInVideo = void 0;
const video_intelligence_1 = require("@google-cloud/video-intelligence");
const protos_1 = require("@google-cloud/video-intelligence/build/protos/protos");
const videoClient = new video_intelligence_1.VideoIntelligenceServiceClient();
const Feature = protos_1.google.cloud.videointelligence.v1.Feature;
const detectLabelsInVideo = (gcsUri) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const request = {
        inputUri: gcsUri,
        features: [Feature.LABEL_DETECTION],
    };
    const [operation] = yield videoClient.annotateVideo(request);
    console.log('Waiting for operation to complete...');
    const [operationResult] = yield operation.promise();
    // Gets annotations for video
    const annotations = (_a = operationResult.annotationResults) === null || _a === void 0 ? void 0 : _a[0];
    const shotLabels = (_b = annotations === null || annotations === void 0 ? void 0 : annotations.shotLabelAnnotations) === null || _b === void 0 ? void 0 : _b.map((shotLabel) => { var _a; return (_a = shotLabel.annotations) === null || _a === void 0 ? void 0 : _a.map((annotation) => annotation.description); }).flat();
    return shotLabels;
});
exports.detectLabelsInVideo = detectLabelsInVideo;
