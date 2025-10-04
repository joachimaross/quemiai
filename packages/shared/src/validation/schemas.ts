import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
});

export const FeedItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  platform: z.enum(['instagram', 'tiktok', 'facebook', 'x']),
  user: z.string(),
  media: z.array(z.string()).optional(),
  timestamp: z.string(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  shares: z.number().optional(),
});

export const AIChatSchema = z.object({
  message: z.string().min(1),
  context: z.string().optional(),
  conversationId: z.string().optional(),
});

export const AICaptionSchema = z.object({
  imageUrl: z.string().url().optional(),
  context: z.string().optional(),
  platform: z.enum(['instagram', 'tiktok', 'facebook', 'x']).optional(),
});

export const MessageSchema = z.object({
  content: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  type: z.enum(['text', 'image', 'video', 'audio']),
});
