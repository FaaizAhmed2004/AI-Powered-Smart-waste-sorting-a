import mongoose, { Schema, Document } from 'mongoose';

export interface IDatasetFile extends Document {
  filename: string;
  originalName: string;
  uploaderId?: string;
  label?: string;
  uploadedAt: Date;
  size?: number;
  mimeType?: string;
}

const DatasetFileSchema = new Schema<IDatasetFile>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  uploaderId: { type: String },
  label: { type: String },
  size: { type: Number },
  mimeType: { type: String }
}, { timestamps: { createdAt: 'uploadedAt' } });

export default mongoose.model<IDatasetFile>('DatasetFile', DatasetFileSchema);
