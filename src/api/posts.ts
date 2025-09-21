import { Router } from 'express';
// import { twitterClient } from '../services/twitter';
import { db } from '../config';
import { neon } from '@netlify/neon';

const router = Router();
const sql = neon();

// Get all posts
router.get('/', (req, res) => {
  // TODO: Implement logic to get all posts
  res.send('Get all posts');
});

// Create a new post
router.post('/', (req, res) => {
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
router.post('/schedule', async (req, res, next) => {
  try {
    const { content, scheduledTime, platform } = req.body;
    if (!content || !scheduledTime || !platform) {
      return res.status(400).send({ error: 'Content, scheduledTime, and platform are required' });
    }

    const docRef = await db.collection('scheduledPosts').add({
      content,
      scheduledTime: new Date(scheduledTime),
      platform,
      status: 'pending',
      createdAt: new Date(),
    });

    res.send({ id: docRef.id, message: 'Post scheduled successfully' });
  } catch (error) {
    next(error);
  }
});

// Export content
router.post('/export', (req, res) => {
  const { videoId, format } = req.body;
  if (!videoId || !format) {
    return res.status(400).send({ error: 'videoId and format are required' });
  }

  // This is a placeholder for actual video export logic
  res.send({ message: `Video ${videoId} exported in ${format} format.` });
});

// Get a specific post
router.get('/:postId', (req, res) => {
  // TODO: Implement logic to get a specific post
  res.send(`Get post ${req.params.postId}`);
});

// Get a specific post using Netlify Neon
router.get('/neon/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;
    if (!post) {
      return res.status(404).send({ error: 'Post not found in Neon DB' });
    }
    res.send(post);
  } catch (error) {
    next(error);
  }
});

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

export default router;