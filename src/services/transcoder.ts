import { TranscoderServiceClient } from '@google-cloud/video-transcoder';
import { config } from '../config';

const transcoderClient = new TranscoderServiceClient();

export const createTranscodingJob = async (inputUri: string, outputUri: string) => {
  const projectId = config.gcpProjectId;
  const location = config.gcpLocation;

  const request = {
    parent: transcoderClient.locationPath(projectId, location),
    job: {
      inputUri: inputUri,
      outputUri: outputUri,
      templateId: 'preset/web-hd', // Use a predefined template or create a custom one
    },
  };

  const [operation] = await transcoderClient.createJob(request);
  console.log(`Transcoding job started: ${operation.name}`);

  return operation.name;
};
