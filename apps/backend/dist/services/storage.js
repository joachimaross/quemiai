"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicUrl = exports.uploadBuffer = exports.uploadFile = void 0;
const storage_1 = require("@google-cloud/storage");
const storage = new storage_1.Storage();
const config_1 = require("../config");
const bucketName = config_1.config.gcsBucketName;
const uploadFile = async (filePath, destination) => {
    await storage.bucket(bucketName).upload(filePath, {
        destination,
    });
    console.log(`${filePath} uploaded to ${bucketName}/${destination}`);
};
exports.uploadFile = uploadFile;
const uploadBuffer = async (buffer, destination) => {
    const file = storage.bucket(bucketName).file(destination);
    await file.save(buffer);
    console.log(`Buffer uploaded to ${bucketName}/${destination}`);
};
exports.uploadBuffer = uploadBuffer;
const getPublicUrl = (fileName) => {
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
};
exports.getPublicUrl = getPublicUrl;
//# sourceMappingURL=storage.js.map