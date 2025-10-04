"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLabelsInVideo = void 0;
const video_intelligence_1 = require("@google-cloud/video-intelligence");
const protos_1 = require("@google-cloud/video-intelligence/build/protos/protos");
const videoClient = new video_intelligence_1.VideoIntelligenceServiceClient();
const { Feature } = protos_1.google.cloud.videointelligence.v1;
const detectLabelsInVideo = async (gcsUri) => {
    const request = {
        inputUri: gcsUri,
        features: [Feature.LABEL_DETECTION],
    };
    const [operation] = await videoClient.annotateVideo(request);
    console.log('Waiting for operation to complete...');
    const [operationResult] = await operation.promise();
    const annotations = operationResult.annotationResults?.[0];
    const shotLabels = annotations?.shotLabelAnnotations
        ?.map((shotLabel) => [
        shotLabel.entity?.description,
        ...(shotLabel.categoryEntities?.map((cat) => cat.description) || []),
    ])
        .flat()
        .filter((description) => !!description);
    return shotLabels;
};
exports.detectLabelsInVideo = detectLabelsInVideo;
//# sourceMappingURL=video.js.map