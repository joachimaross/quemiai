import { Router } from 'express';
import multer from 'multer';
import { improveText, generateCaptions, AdvancedRecommendationEngine } from '../services/ai';
import { detectLabelsInVideo } from '../services/video';
import { createTranscodingJob } from '../services/transcoder';
import AppError from '../utils/AppError';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/improve-text', (req, res, next) => {
  const { text } = req.body;
  if (!text) {
    return next(new AppError('Text is required', 400));
  }

  const result = improveText(text);
  return res.send(result);
});

router.post('/generate-captions', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('File is required', 400));
  }

  try {
    const captions = await generateCaptions(req.file.path);
    return res.send({ captions });
  } catch (error) {
    return next(error);
  }
});

router.post('/advanced-recommendations', async (req, res, next) => {
  const { posts, likedPosts, userId } = req.body;
  if (!posts || !likedPosts || !userId) {
    return next(new AppError('posts, likedPosts, and userId are required', 400));
  }

  try {
    const engine = new AdvancedRecommendationEngine();
    await engine.train(posts, likedPosts);
    const recommendations = await engine.getRecommendations(userId, posts);
    return res.send({ recommendations });
  } catch (error) {
    return next(error);
  }
});

router.post('/detect-video-labels', async (req, res, next) => {
  const { gcsUri } = req.body;
  if (!gcsUri) {
    return next(new AppError('Google Cloud Storage URI is required', 400));
  }

  try {
    const labels = await detectLabelsInVideo(gcsUri);
    return res.send({ labels });
  } catch (error) {
    return next(error);
  }
});

router.post('/music-integration', (req, res, next) => {
  const { trackId, videoId } = req.body;
  if (!trackId || !videoId) {
    return next(new AppError('trackId and videoId are required', 400));
  }

  // This is a placeholder for actual music integration logic
  return res.send({ message: `Music track ${trackId} integrated with video ${videoId}` });
});

router.post('/transcode-video', async (req, res, next) => {
  const { inputUri, outputUri } = req.body;
  if (!inputUri || !outputUri) {
    return next(new AppError('inputUri and outputUri are required', 400));
  }

  try {
    const jobName = await createTranscodingJob(inputUri, outputUri);
    return res.send({ jobName, message: 'Transcoding job started' });
  } catch (error) {
    return next(error);
  }
});

router.post('/chat-assistant', (req, res, next) => {
  const { message } = req.body;
  if (!message) {
    return next(new AppError('Message is required', 400));
  }

  // This is a placeholder for actual AI chat assistant logic
  // In a real application, this would interact with a conversational AI platform (e.g., Dialogflow)
  const response = `You said: "${message}". I am an AI assistant. How can I help you further?`;
  return res.send({ response });
});

export default router;