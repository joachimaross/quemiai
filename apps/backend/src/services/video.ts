import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import { google } from '@google-cloud/video-intelligence/build/protos/protos';

const videoClient = new VideoIntelligenceServiceClient();
const { Feature } = google.cloud.videointelligence.v1;
type ILabelAnnotation = google.cloud.videointelligence.v1.ILabelAnnotation;

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

  // The original code was attempting to access a non-existent `annotations` property.
  // This corrected version extracts descriptions from the entity and categoryEntities,
  // which is the likely intended behavior.
  const shotLabels = annotations?.shotLabelAnnotations
    ?.map((shotLabel: ILabelAnnotation) => [
      shotLabel.entity?.description,
      ...(shotLabel.categoryEntities?.map((cat) => cat.description) || []),
    ])
    .flat()
    .filter((description): description is string => !!description);

  return shotLabels;
};
