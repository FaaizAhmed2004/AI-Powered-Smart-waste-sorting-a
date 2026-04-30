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
exports.deleteClassification = exports.getAllClassifications = exports.getUserClassifications = exports.classifyImage = void 0;
const Classification_1 = __importDefault(require("../model/Classification"));
const express_validator_1 = require("express-validator");
const classifyImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { imageUrl, label, confidence } = req.body;
        if (!imageUrl || !label || confidence === undefined) {
            return res.status(400).json({
                message: 'imageUrl, label, and confidence are required'
            });
        }
        const classification = yield Classification_1.default.create({
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            imageUrl,
            label,
            confidence: parseFloat(confidence)
        });
        return res.status(201).json({
            success: true,
            message: 'Classification saved successfully',
            data: classification
        });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
        return res.status(500).json({
            success: false,
            message: 'Failed to save classification',
            error: errorMessage
        });
    }
});
exports.classifyImage = classifyImage;
const getUserClassifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const records = yield Classification_1.default.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: records });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch classifications',
            error: err
        });
    }
});
exports.getUserClassifications = getUserClassifications;
const getAllClassifications = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const records = yield Classification_1.default.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: records });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', error: err });
    }
});
exports.getAllClassifications = getAllClassifications;
const deleteClassification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield Classification_1.default.findByIdAndDelete(id);
        if (!deleted)
            return res.status(404).json({ success: false, message: 'Record not found' });
        return res.status(200).json({ success: true, message: 'Record deleted' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', error: err });
    }
});
exports.deleteClassification = deleteClassification;
//# sourceMappingURL=classificationController.js.map