import { Router, Request, Response } from 'express';

const router: Router = Router();

// Get all conversations
router.get('/', (_req: Request, res: Response) => {
  // TODO: Implement logic to get all conversations
  res.send('Get all conversations');
});

// Create a new conversation
router.post('/', (_req: Request, res: Response) => {
  // TODO: Implement logic to create a new conversation
  res.send('Create a new conversation');
});

// Get a specific conversation
router.get('/:conversationId', (req: Request, res: Response) => {
  // TODO: Implement logic to get a specific conversation
  res.send(`Get conversation ${req.params.conversationId}`);
});

// Send a message
router.post('/:conversationId/messages', (req: Request) => {
  // TODO: Implement logic to send a message
  console.log(`Send a message to conversation ${req.params.conversationId}`);
});

export default router;
