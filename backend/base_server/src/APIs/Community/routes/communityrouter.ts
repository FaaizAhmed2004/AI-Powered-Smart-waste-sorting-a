/* eslint-disable @typescript-eslint/no-misused-promises */
// src/routes/community.routes.ts
import { Router } from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  toggleLike,
  addComment,
  deletePost,
} from '../controller/communitycontroller';

import { validate } from '../validator/communityvalidator';
import { createPostSchema, commentSchema } from '../validator/community.validator';
import authMiddleware from '../../../middlewares/authenticate';
import asyncHandler from '../../../handlers/async';

const communityrouter = Router();

communityrouter.post('/', authMiddleware, asyncHandler, validate(createPostSchema), createPost);
communityrouter.get('/', getAllPosts);
communityrouter.get('/:id', getPostById);
communityrouter.post('/:id/like', authMiddleware, asyncHandler, toggleLike);
communityrouter.post('/:id/comment', authMiddleware, validate(commentSchema), asyncHandler(addComment));
communityrouter.delete('/:id', authMiddleware, asyncHandler(deletePost));

export default communityrouter;
