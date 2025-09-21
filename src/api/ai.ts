import { Router } from 'express';
import multer from 'multer';
import { improveText, generateCaptions, AdvancedRecommendationEngine } from '../services/ai';
import { detectLabelsInVideo } from '../services/video';
import { createTranscodingJob } from '../services/transcoder';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/improve-text', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).send({ error: 'Text is required' });
  }

  const result = improveText(text);
  res.send(result);
});

router.post('/generate-captions', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send({ error: 'File is required' });
  }

  try {
    const captions = await generateCaptions(req.file.path);
    res.send({ captions });
  } catch (error) {
    next(error);
  }
});

router.post('/advanced-recommendations', async (req, res, next) => {
  const { posts, likedPosts, userId } = req.body;
  if (!posts || !likedPosts || !userId) {
    return res.status(400).send({ error: 'posts, likedPosts, and userId are required' });
  }

  try {
    const engine = new AdvancedRecommendationEngine();
    await engine.train(posts, likedPosts);
    const recommendations = await engine.getRecommendations(userId, posts);
    res.send({ recommendations });
  } catch (error) {
    next(error);
  }
});

router.post('/detect-video-labels', async (req, res, next) => {
  const { gcsUri } = req.body;
  if (!gcsUri) {
    return res.status(400).send({ error: 'Google Cloud Storage URI is required' });
  }

  try {
    const labels = await detectLabelsInVideo(gcsUri);
    res.send({ labels });
  } catch (error) {
    next(error);
  }
});

router.post('/music-integration', (req, res) => {
  const { trackId, videoId } = req.body;
  if (!trackId || !videoId) {
    return res.status(400).send({ error: 'trackId and videoId are required' });
  }

  // This is a placeholder for actual music integration logic
  res.send({ message: `Music track ${trackId} integrated with video ${videoId}` });
});

router.post('/transcode-video', async (req, res, next) => {
  const { inputUri, outputUri } = req.body;
  if (!inputUri || !outputUri) {
    return res.status(400).send({ error: 'inputUri and outputUri are required' });
  }

  try {
    const jobName = await createTranscodingJob(inputUri, outputUri);
    res.send({ jobName, message: 'Transcoding job started' });
  } catch (error) {
    next(error);
  }
});

router.post('/chat-assistant', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send({ error: 'Message is required' });
  }

  // This is a placeholder for actual AI chat assistant logic
  // In a real application, this would interact with a conversational AI platform (e.g., Dialogflow)
  const response = `You said: "${message}". I am an AI assistant. How can I help you further?`;
  res.send({ response });
});

export default router;
