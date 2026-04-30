import mongoose, { Schema, Document } from 'mongoose';

export interface IClassification extends Document {
  userId: string;
  imageUrl: string;
  label: string;
  confidence: number;
  createdAt: Date;
}

const classificationSchema = new Schema<IClassification>({
  userId: { type: String, required: true },
  imageUrl: { type: String, required: true },
  label: { type: String, required: true },
  confidence: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IClassification>('Classification', classificationSchema);
