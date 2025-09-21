import { TwitterApi } from 'twitter-api-v2';

// Get the Twitter API keys from environment variables
import { config } from '../config';

const client = new TwitterApi({
  appKey: config.twitter.appKey,
  appSecret: config.twitter.appSecret,
  accessToken: config.twitter.accessToken,
  accessSecret: config.twitter.accessSecret,
});

// export const twitterClient = client.readWrite;
