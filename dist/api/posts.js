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
const express_1 = require('express');
// import { twitterClient } from '../services/twitter';
const config_1 = require('../config');
const neon_1 = require('@netlify/neon');
const router = (0, express_1.Router)();
const sql = (0, neon_1.neon)();
// Get all posts
router.get('/', (_req, res) => {
  // TODO: Implement logic to get all posts
  res.send('Get all posts');
});
// Create a new post
router.post('/', (_req, res) => {
  // TODO: Implement logic to create a new post
  res.send('Create a new post');
});
// Post a tweet
/* router.post('/tweet', async (req, res, next) => {
  try {
    const { tweet } = req.body;
    if (!tweet) {
      return res.status(400).send({ error: 'Tweet content is required' });
    }
    const result = await twitterClient.v2.tweet(tweet);
    res.send(result);
  } catch (error) {
    next(error);
  }
}); */
// Schedule a post
router.post('/schedule', (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { content, scheduledTime, platform } = req.body;
      if (!content || !scheduledTime || !platform) {
        return res.status(400).send({ error: 'Content, scheduledTime, and platform are required' });
      }
      const docRef = yield config_1.db.collection('scheduledPosts').add({
        content,
        scheduledTime: new Date(scheduledTime),
        platform,
        status: 'pending',
        createdAt: new Date(),
      });
      return res.send({ id: docRef.id, message: 'Post scheduled successfully' });
    } catch (error) {
      return next(error);
    }
  }),
);
// Export content
router.post('/export', (req, res) => {
  const { videoId, format } = req.body;
  if (!videoId || !format) {
    return res.status(400).send({ error: 'videoId and format are required' });
  }
  // This is a placeholder for actual video export logic
  return res.send({ message: `Video ${videoId} exported in ${format} format.` });
});
// Get a specific post
router.get('/:postId', (req, res) => {
  // TODO: Implement logic to get a specific post
  res.send(`Get post ${req.params.postId}`);
});
// Get a specific post using Netlify Neon
router.get('/neon/:postId', (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { postId } = req.params;
      const [post] = yield sql`SELECT * FROM posts WHERE id = ${postId}`;
      if (!post) {
        return res.status(404).send({ error: 'Post not found in Neon DB' });
      }
      return res.send(post);
    } catch (error) {
      return next(error);
    }
  }),
);
// Update a post
router.put('/:postId', (req, res) => {
  // TODO: Implement logic to update a post
  res.send(`Update post ${req.params.postId}`);
});
// Delete a post
router.delete('/:postId', (req, res) => {
  // TODO: Implement logic to delete a post
  res.send(`Delete post ${req.params.postId}`);
});
exports.default = router;
