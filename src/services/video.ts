import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import { google } from '@google-cloud/video-intelligence/build/protos/protos';

const videoClient = new VideoIntelligenceServiceClient();
const Feature = google.cloud.videointelligence.v1.Feature;

export const detectLabelsInVideo = async (gcsUri: string) => {
  const request = {
    inputUri: gcsUri,
    features: [Feature.LABEL_DETECTION],
  };

  const [operation] = await videoClient.annotateVideo(request);
  console.log('Waiting for operation to complete...');
  const [operationResult] = await operation.promise();

  // Gets annotations for video
  const annotations = operationResult.annotationResults?.[0];
  const shotLabels = annotations?.shotLabelAnnotations
    ?.map((shotLabel: any) => shotLabel.annotations?.map((annotation: any) => annotation.description))
    .flat();

  return shotLabels;
};
