import { Schema, model, Document, Types } from "mongoose";

export interface IPrediction extends Document {
  user: string;
  label: string;
  confidence: number;
  flagged: boolean;
  createdAt: Date;
}

const predictionSchema = new Schema<IPrediction>(
  {
      user: Types.ObjectId,   // <-- FIX
    label: String,
    confidence: Number,
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IPrediction>("Prediction", predictionSchema);
