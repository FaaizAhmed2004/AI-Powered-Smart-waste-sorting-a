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
/**
 * @desc Save classification result to database
 * @route POST /api/classify
 * @access Private
 */
const classifyImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        // Get user ID from authenticated user
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication failed'
            });
        }
        const classification = yield Classification_1.default.create({
            userId,
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
        console.error('Classification save error:', errorMessage);
        return res.status(500).json({
            success: false,
            message: 'Failed to save classification',
            error: errorMessage
        });
    }
});
exports.classifyImage = classifyImage;
/**
 * @desc Get all classifications for logged-in user
 * @route GET /api/classify/history/:userId
 * @access Private
 */
const getUserClassifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userId } = req.params;
        // Validate user owns this data
        const authenticatedUserId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!authenticatedUserId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication failed'
            });
        }
        // Security: Only allow users to access their own classifications (unless admin)
        if (userId !== authenticatedUserId) {
            console.warn(`Unauthorized access attempt: User ${authenticatedUserId} tried to access ${userId}'s classifications`);
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Cannot access other user\'s classifications'
            });
        }
        const records = yield Classification_1.default.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: records });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
        console.error('Get classifications error:', errorMessage);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch classifications',
            error: errorMessage
        });
    }
});
exports.getUserClassifications = getUserClassifications;
/**
 * @desc Get all classifications (Admin)
 * @route GET /api/classify/all
 * @access Admin
 */
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
/**
 * @desc Delete classification by ID
 * @route DELETE /api/classify/:id
 * @access Private
 */
const deleteClassification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        // Get the record first to verify ownership
        const record = yield Classification_1.default.findById(id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        // Verify user owns the record
        const authenticatedUserId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (record.userId !== authenticatedUserId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Cannot delete other user\'s classifications'
            });
        }
        yield Classification_1.default.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'Record deleted' });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
        console.error('Delete classification error:', errorMessage);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: errorMessage
        });
    }
});
exports.deleteClassification = deleteClassification;
