"use strict";
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
exports.getLeaderboard = exports.penalizeIncorrect = exports.recordClassification = void 0;
const Gameuser_1 = __importDefault(require("../model/Gameuser"));
const predictionmodel_1 = __importDefault(require("../model/predictionmodel"));
const achievement_1 = require("../model/achievement");
const recordClassification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, label, confidence } = req.body;
        const user = yield Gameuser_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const prediction = yield predictionmodel_1.default.create({ user: userId, label, confidence });
        let points = 0;
        if (confidence > 0.7)
            points = 10;
        else if (confidence >= 0.5)
            points = 5;
        user.points += points;
        const today = new Date().toDateString();
        const lastActive = user.lastActive ? user.lastActive.toDateString() : null;
        if (lastActive === today) {
        }
        else {
            if (user.lastActive &&
                new Date(user.lastActive).getTime() >= Date.now() - 1000 * 60 * 60 * 24 * 2) {
                user.dailyStreak += 1;
            }
            else {
                user.dailyStreak = 1;
            }
            user.lastActive = new Date();
        }
        const totalPred = yield predictionmodel_1.default.countDocuments({ user: userId });
        const newBadges = (0, achievement_1.checkAchievements)(totalPred);
        newBadges.forEach((b) => {
            if (!user.badges.includes(b))
                user.badges.push(b);
        });
        yield user.save();
        return res.json({
            success: true,
            pointsAwarded: points,
            streak: user.dailyStreak,
            badgesUnlocked: newBadges,
            prediction,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.recordClassification = recordClassification;
const penalizeIncorrect = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, predictionId } = req.body;
        const user = yield Gameuser_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const pred = yield predictionmodel_1.default.findById(predictionId);
        if (!pred)
            return res.status(404).json({ message: "Prediction not found" });
        pred.flagged = true;
        yield pred.save();
        user.points -= 2;
        if (user.points < 0)
            user.points = 0;
        yield user.save();
        return res.json({ success: true, message: "User penalized -2 points" });
    }
    catch (err) {
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.penalizeIncorrect = penalizeIncorrect;
const getLeaderboard = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield Gameuser_1.default.find()
            .sort({ points: -1 })
            .limit(10)
            .select("name points badges dailyStreak");
        return res.json({ success: true, data: users });
    }
    catch (err) {
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getLeaderboard = getLeaderboard;
//# sourceMappingURL=gamecontroller.js.map