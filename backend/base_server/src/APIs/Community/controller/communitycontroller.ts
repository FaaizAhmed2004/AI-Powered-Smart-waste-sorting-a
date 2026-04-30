/* eslint-disable @typescript-eslint/no-namespace */
// src/controllers/community.controller.ts

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import CommunityPost from '../model/communitymodel';

declare global {
  namespace Express {
    interface Request {
      user: { _id: string };
    }
  }
}

export const createPost = async (req: Request, res: Response) => {
  try {
    const { content } = req.body as { content: string };

    if (!content || typeof content !== 'string') {
      res.status(400).json({ success: false, message: 'Content is required and must be a string' });
      return;
    }

    const post = await CommunityPost.create({
      user: req.user._id,
      content,
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
    return;
  }
};

export const getAllPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await CommunityPost.find()
      .populate('user', 'name email')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('user', 'name email')
      .populate('comments.user', 'name email');

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
    return;
  }
};

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    const userId = new Types.ObjectId(req.user._id);

    if (post.likes.includes(userId)) {
      // already liked → unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
    return;
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { text } = req.body as { text: string };

    if (!text || typeof text !== 'string') {
      res.status(400).json({ success: false, message: 'Text is required and must be a string' });
      return;
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    post.comments.push({
      user: new Types.ObjectId(req.user._id),
      text,
      createdAt: new Date(),
    });

    await post.save();
    res.json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
    return;
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
    return;
  }
};
