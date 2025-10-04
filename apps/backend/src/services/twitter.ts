import { TwitterApi } from 'twitter-api-v2';

// Get the Twitter API keys from environment variables
import { config } from '../config';

export const twitterClient = new TwitterApi({
  appKey: config.twitter.appKey,
  appSecret: config.twitter.appSecret,
  accessToken: config.twitter.accessToken,
  accessSecret: config.twitter.accessSecret,
}).readWrite;
