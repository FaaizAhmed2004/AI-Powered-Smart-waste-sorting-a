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
exports.getUserReport = exports.generateUserReport = void 0;
const Insight_1 = __importDefault(require("../model/Insight"));
const Classification_1 = __importDefault(require("../../Classification/model/Classification"));
const express_validator_1 = require("express-validator");
const generateUserReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { userId, periodStart, periodEnd } = req.body;
        const start = new Date(periodStart);
        const end = new Date(periodEnd);
        const records = yield Classification_1.default.find({
            userId,
            createdAt: { $gte: start, $lte: end },
        });
        const totals = {};
        let totalCount = 0;
        records.forEach(r => {
            totals[r.label] = (totals[r.label] || 0) + 1;
            totalCount++;
        });
        const co2SavedKg = totalCount * 0.5;
        const report = yield Insight_1.default.create({
            userId,
            periodStart: start,
            periodEnd: end,
            totals: {
                plastic: totals['Plastic'] || 0,
                paper: totals['Paper'] || 0,
                metal: totals['Metal'] || 0,
                organic: totals['Organic'] || 0,
                eWaste: totals['E-Waste'] || 0,
                hazardous: totals['Hazardous'] || 0,
                totalWeightKg: totalCount,
            },
            co2SavedKg
        });
        return res.status(201).json({ success: true, data: report });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', error: err });
    }
});
exports.generateUserReport = generateUserReport;
const getUserReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const reports = yield Insight_1.default.find({ userId }).sort({ periodStart: -1 });
        return res.status(200).json({ success: true, data: reports });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', error: err });
    }
});
exports.getUserReport = getUserReport;
//# sourceMappingURL=insightController.js.map