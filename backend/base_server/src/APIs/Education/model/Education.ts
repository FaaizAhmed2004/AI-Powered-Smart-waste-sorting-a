import mongoose, { Schema, Document } from 'mongoose';

export interface IEducationTip extends Document {
  category: string; // e.g., "plastic", "paper", etc.
  title: string;
  description: string;
  examples?: string[]; // example items
  createdAt: Date;
  updatedAt: Date;
}

const EducationTipSchema = new Schema<IEducationTip>(
  {
    category: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    examples: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IEducationTip>('EducationTip', EducationTipSchema);
