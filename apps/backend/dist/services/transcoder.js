"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTranscodingJob = void 0;
const video_transcoder_1 = require("@google-cloud/video-transcoder");
const config_1 = require("../config");
const transcoderClient = new video_transcoder_1.TranscoderServiceClient();
const createTranscodingJob = async (inputUri, outputUri) => {
    const projectId = config_1.config.gcpProjectId;
    const location = config_1.config.gcpLocation;
    const request = {
        parent: transcoderClient.locationPath(projectId, location),
        job: {
            inputUri: inputUri,
            outputUri: outputUri,
            templateId: 'preset/web-hd',
        },
    };
    const [operation] = await transcoderClient.createJob(request);
    console.log(`Transcoding job started: ${operation.name}`);
    return operation.name;
};
exports.createTranscodingJob = createTranscodingJob;
//# sourceMappingURL=transcoder.js.map