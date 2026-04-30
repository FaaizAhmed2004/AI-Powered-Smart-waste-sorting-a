"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GameuserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    dailyStreak: { type: Number, default: 0 },
    lastActive: { type: Date, default: null },
});
exports.default = (0, mongoose_1.model)("GameUser", GameuserSchema);
//# sourceMappingURL=Gameuser.js.map