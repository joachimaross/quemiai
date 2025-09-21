'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createTranscodingJob = void 0;
const video_transcoder_1 = require('@google-cloud/video-transcoder');
const config_1 = require('../config');
const transcoderClient = new video_transcoder_1.TranscoderServiceClient();
const createTranscodingJob = (inputUri, outputUri) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const projectId = config_1.config.gcpProjectId;
    const location = config_1.config.gcpLocation;
    const request = {
      parent: transcoderClient.locationPath(projectId, location),
      job: {
        inputUri: inputUri,
        outputUri: outputUri,
        templateId: 'preset/web-hd', // Use a predefined template or create a custom one
      },
    };
    const [operation] = yield transcoderClient.createJob(request);
    console.log(`Transcoding job started: ${operation.name}`);
    return operation.name;
  });
exports.createTranscodingJob = createTranscodingJob;
