import { Router } from 'express';
import usersRouter from './users';
import postsRouter from './posts';
import messagesRouter from './messages';
import analyticsRouter from './analytics';
import marketplaceRouter from './marketplace';
import aiRouter from './ai';
import authRouter from './auth';
import socialMediaRouter from './social-media';
import searchRouter from './search/route';

const router: Router = Router();

router.use('/users', usersRouter);
router.use('/posts', postsRouter);
router.use('/messages', messagesRouter);
router.use('/analytics', analyticsRouter);
router.use('/marketplace', marketplaceRouter);
router.use('/ai', aiRouter);
router.use('/auth', authRouter);
router.use('/social-media', socialMediaRouter);
router.use('/search', searchRouter);

export default router;
