"use strict";
/* eslint-disable @typescript-eslint/no-namespace */
// src/controllers/community.controller.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.addComment = exports.toggleLike = exports.getPostById = exports.getAllPosts = exports.createPost = void 0;
const mongoose_1 = require("mongoose");
const communitymodel_1 = __importDefault(require("../model/communitymodel"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        if (!content || typeof content !== 'string') {
            res.status(400).json({ success: false, message: 'Content is required and must be a string' });
            return;
        }
        const post = yield communitymodel_1.default.create({
            user: req.user._id,
            content,
        });
        res.status(201).json({ success: true, post });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error });
        return;
    }
});
exports.createPost = createPost;
const getAllPosts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield communitymodel_1.default.find()
            .populate('user', 'name email')
            .populate('comments.user', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, posts });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error });
    }
});
exports.getAllPosts = getAllPosts;
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield communitymodel_1.default.findById(req.params.id)
            .populate('user', 'name email')
            .populate('comments.user', 'name email');
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        res.json({ success: true, post });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error });
        return;
    }
});
exports.getPostById = getPostById;
const toggleLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield communitymodel_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        const userId = new mongoose_1.Types.ObjectId(req.user._id);
        if (post.likes.includes(userId)) {
            // already liked → unlike
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        }
        else {
            post.likes.push(userId);
        }
        yield post.save();
        res.json({ success: true, likes: post.likes.length });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error });
        return;
    }
});
exports.toggleLike = toggleLike;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string') {
            res.status(400).json({ success: false, message: 'Text is required and must be a string' });
            return;
        }
        const post = yield communitymodel_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        post.comments.push({
            user: new mongoose_1.Types.ObjectId(req.user._id),
            text,
            createdAt: new Date(),
        });
        yield post.save();
        res.json({ success: true, comments: post.comments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error });
        return;
    }
});
exports.addComment = addComment;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield communitymodel_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        if (post.user.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }
        yield post.deleteOne();
        res.json({ success: true, message: 'Post deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error });
        return;
    }
});
exports.deletePost = deletePost;
