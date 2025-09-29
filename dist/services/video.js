"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLabelsInVideo = void 0;
const video_intelligence_1 = require("@google-cloud/video-intelligence");
const protos_1 = require("@google-cloud/video-intelligence/build/protos/protos");
const videoClient = new video_intelligence_1.VideoIntelligenceServiceClient();
const { Feature } = protos_1.google.cloud.videointelligence.v1;
const detectLabelsInVideo = async (gcsUri) => {
    var _a, _b;
    const request = {
        inputUri: gcsUri,
        features: [Feature.LABEL_DETECTION],
    };
    const [operation] = await videoClient.annotateVideo(request);
    console.log('Waiting for operation to complete...');
    const [operationResult] = await operation.promise();
    // Gets annotations for video
    const annotations = (_a = operationResult.annotationResults) === null || _a === void 0 ? void 0 : _a[0];
    // The original code was attempting to access a non-existent `annotations` property.
    // This corrected version extracts descriptions from the entity and categoryEntities,
    // which is the likely intended behavior.
    const shotLabels = (_b = annotations === null || annotations === void 0 ? void 0 : annotations.shotLabelAnnotations) === null || _b === void 0 ? void 0 : _b.map((shotLabel) => {
        var _a, _b;
        return [
            (_a = shotLabel.entity) === null || _a === void 0 ? void 0 : _a.description,
            ...(((_b = shotLabel.categoryEntities) === null || _b === void 0 ? void 0 : _b.map((cat) => cat.description)) || []),
        ];
    }).flat().filter((description) => !!description);
    return shotLabels;
};
exports.detectLabelsInVideo = detectLabelsInVideo;
