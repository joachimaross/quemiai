"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const twitter_api_v2_1 = require("twitter-api-v2");
// Get the Twitter API keys from environment variables
const config_1 = require("../config");
const client = new twitter_api_v2_1.TwitterApi({
    appKey: config_1.config.twitter.appKey,
    appSecret: config_1.config.twitter.appSecret,
    accessToken: config_1.config.twitter.accessToken,
    accessSecret: config_1.config.twitter.accessSecret,
});
// export const twitterClient = client.readWrite;
