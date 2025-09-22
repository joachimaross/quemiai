import { Router } from 'express';
import multer from 'multer';
import { improveText, generateCaptions, AdvancedRecommendationEngine } from '../services/ai';
import { detectLabelsInVideo } from '../services/video';
import { createTranscodingJob } from '../services/transcoder';
import AppError from '../utils/AppError';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/improve-text', (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      next(new AppError('Text is required', 400));
      return;
    }
    const result = improveText(text);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.post('/generate-captions', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    next(new AppError('File is required', 400));
    return;
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
    next(new AppError('posts, likedPosts, and userId are required', 400));
    return;
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
    next(new AppError('Google Cloud Storage URI is required', 400));
    return;
  }

  try {
    const labels = await detectLabelsInVideo(gcsUri);
    res.send({ labels });
  } catch (error) {
    next(error);
  }
});

router.post('/music-integration', (req, res, next) => {
  try {
    const { trackId, videoId } = req.body;
    if (!trackId || !videoId) {
      next(new AppError('trackId and videoId are required', 400));
      return;
    }

    // This is a placeholder for actual music integration logic
    res.send({ message: `Music track ${trackId} integrated with video ${videoId}` });
  } catch (error) {
    next(error);
  }
});

router.post('/transcode-video', async (req, res, next) => {
  const { inputUri, outputUri } = req.body;
  if (!inputUri || !outputUri) {
    next(new AppError('inputUri and outputUri are required', 400));
    return;
  }

  try {
    const jobName = await createTranscodingJob(inputUri, outputUri);
    res.send({ jobName, message: 'Transcoding job started' });
  } catch (error) {
    next(error);
  }
});

router.post('/chat-assistant', (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      next(new AppError('Message is required', 400));
      return;
    }

    // This is a placeholder for actual AI chat assistant logic
    const response = `You said: \"${message}\". I am an AI assistant. How can I help you further?`;
    res.send({ response });
  } catch (error) {
    next(error);
  }
});

export default router;
