import { Router } from 'express';
import usersRouter from './users';
import postsRouter from './posts';
import messagesRouter from './messages';
import analyticsRouter from './analytics';
import marketplaceRouter from './marketplace';
import aiRouter from './ai';
import authRouter from './auth';
import socialRouter from './social';

const router = Router();

router.use('/users', usersRouter);
router.use('/posts', postsRouter);
router.use('/messages', messagesRouter);
router.use('/analytics', analyticsRouter);
router.use('/marketplace', marketplaceRouter);
router.use('/ai', aiRouter);
router.use('/auth', authRouter);
router.use('/', socialRouter);

export default router;
