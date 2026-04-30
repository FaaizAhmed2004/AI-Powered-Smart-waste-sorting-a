import { Request, Response } from "express";
import Gameuser from "../model/Gameuser";
import Prediction from "../model/predictionmodel";
import { checkAchievements } from "../model/achievement";

export const recordClassification = async (req: Request, res: Response) => {
  try {
    const { userId, label, confidence } = req.body;

    const user = await Gameuser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Save prediction log
    const prediction = await Prediction.create({ user: userId, label, confidence });

    // Award points
    let points = 0;
    if (confidence > 0.7) points = 10;
    else if (confidence >= 0.5) points = 5;

    user.points += points;

    // Daily streak
    const today = new Date().toDateString();
    const lastActive = user.lastActive ? user.lastActive.toDateString() : null;

    if (lastActive === today) {
      // Already logged today → do nothing
    } else {
      // New active day
      if (
        user.lastActive &&
        new Date(user.lastActive).getTime() >= Date.now() - 1000 * 60 * 60 * 24 * 2
      ) {
        user.dailyStreak += 1;
      } else {
        user.dailyStreak = 1;
      }
      user.lastActive = new Date();
    }

    // Check achievements
    const totalPred = await Prediction.countDocuments({ user: userId });
    const newBadges = checkAchievements(totalPred);

    newBadges.forEach((b) => {
      if (!user.badges.includes(b)) user.badges.push(b);
    });

    await user.save();

    return res.json({
      success: true,
      pointsAwarded: points,
      streak: user.dailyStreak,
      badgesUnlocked: newBadges,
      prediction,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};
//penalizeincorrectness 
export const penalizeIncorrect = async (req: Request, res: Response) => {
  try {
    const { userId, predictionId } = req.body;

    const user = await Gameuser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pred = await Prediction.findById(predictionId);
    if (!pred) return res.status(404).json({ message: "Prediction not found" });

    pred.flagged = true;
    await pred.save();

    user.points -= 2;
    if (user.points < 0) user.points = 0;

    await user.save();

    return res.json({ success: true, message: "User penalized -2 points" });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};
//leaderboards
export const getLeaderboard = async (_req: Request, res: Response) => {
  try {
    const users = await Gameuser.find()
      .sort({ points: -1 })
      .limit(10)
      .select("name points badges dailyStreak");

    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};
