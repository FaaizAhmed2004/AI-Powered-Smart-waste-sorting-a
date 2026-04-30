"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const predictionSchema = new mongoose_1.Schema({
    user: mongoose_1.Types.ObjectId,
    label: String,
    confidence: Number,
    flagged: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Prediction", predictionSchema);
//# sourceMappingURL=predictionmodel.js.map