"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentSchema = exports.createPostSchema = void 0;
// src/validators/community.validator.ts
const zod_1 = require("zod");
exports.createPostSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(3, 'Content must be at least 3 characters'),
    }),
});
exports.commentSchema = zod_1.z.object({
    body: zod_1.z.object({
        text: zod_1.z.string().min(1, 'Comment cannot be empty'),
    }),
});
