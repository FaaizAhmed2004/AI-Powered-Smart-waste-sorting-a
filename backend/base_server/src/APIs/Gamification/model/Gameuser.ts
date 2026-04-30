import { Schema, model, Document } from "mongoose";

export interface IGameUser extends Document {
  name: string;
  email: string;
  points: number;
  badges: string[];
  dailyStreak: number;
  lastActive: Date;
}

const GameuserSchema = new Schema<IGameUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  points: { type: Number, default: 0 },
  badges: [{ type: String }],
  dailyStreak: { type: Number, default: 0 },
  lastActive: { type: Date, default: null },
});

export default model<IGameUser>("GameUser", GameuserSchema);
