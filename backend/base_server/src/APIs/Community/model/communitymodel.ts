// src/models/community.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ICommunityPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
}

const CommentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CommunityPostSchema = new Schema<ICommunityPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ICommunityPost>(
  'CommunityPost',
  CommunityPostSchema
);
