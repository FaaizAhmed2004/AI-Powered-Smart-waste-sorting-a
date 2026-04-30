import mongoose, { Schema, Document } from 'mongoose';

export interface IInsightReport extends Document {
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  totals: {
    plastic?: number;
    paper?: number;
    metal?: number;
    organic?: number;
    eWaste?: number;
    hazardous?: number;
    totalWeightKg?: number;
  };
  co2SavedKg?: number;
  createdAt: Date;
}

const InsightSchema = new Schema<IInsightReport>({
  userId: { type: String, required: true, index: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  totals: {
    plastic: { type: Number, default: 0 },
    paper: { type: Number, default: 0 },
    metal: { type: Number, default: 0 },
    organic: { type: Number, default: 0 },
    eWaste: { type: Number, default: 0 },
    hazardous: { type: Number, default: 0 },
    totalWeightKg: { type: Number, default: 0 },
  },
  co2SavedKg: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IInsightReport>('InsightReport', InsightSchema);
