// src/validators/community.validator.ts
import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(3, 'Content must be at least 3 characters'),
  }),
});

export const commentSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Comment cannot be empty'),
  }),
});
