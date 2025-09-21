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
exports.getPublicUrl = exports.uploadBuffer = exports.uploadFile = void 0;
const storage_1 = require("@google-cloud/storage");
const storage = new storage_1.Storage();
const config_1 = require("../config");
const bucketName = config_1.config.gcsBucketName;
const uploadFile = (filePath, destination) => __awaiter(void 0, void 0, void 0, function* () {
    yield storage.bucket(bucketName).upload(filePath, {
        destination,
    });
    console.log(`${filePath} uploaded to ${bucketName}/${destination}`);
});
exports.uploadFile = uploadFile;
const uploadBuffer = (buffer, destination) => __awaiter(void 0, void 0, void 0, function* () {
    const file = storage.bucket(bucketName).file(destination);
    yield file.save(buffer);
    console.log(`Buffer uploaded to ${bucketName}/${destination}`);
});
exports.uploadBuffer = uploadBuffer;
const getPublicUrl = (fileName) => {
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
};
exports.getPublicUrl = getPublicUrl;
