import { Storage } from '@google-cloud/storage';

const storage = new Storage();
import { config } from '../config';

const bucketName = config.gcsBucketName;

export const uploadFile = async (filePath: string, destination: string) => {
  await storage.bucket(bucketName).upload(filePath, {
    destination,
  });
  console.log(`${filePath} uploaded to ${bucketName}/${destination}`);
};

export const getPublicUrl = (fileName: string) => {
  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
};
