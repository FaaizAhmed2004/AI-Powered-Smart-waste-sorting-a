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
exports.deleteTip = exports.updateTip = exports.createTip = exports.getAllTips = exports.getTipsByCategory = void 0;
const Education_1 = __importDefault(require("../model/Education"));
const express_validator_1 = require("express-validator");
const getTipsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.params;
        const tips = yield Education_1.default.find({ category }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: tips });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', error: err });
    }
});
exports.getTipsByCategory = getTipsByCategory;
const getAllTips = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tips = yield Education_1.default.find().sort({ category: 1, createdAt: -1 });
        return res.status(200).json({ success: true, data: tips });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', error: err });
    }
});
exports.getAllTips = getAllTips;
const createTip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { category, title, description, examples } = req.body;
        const tip = yield Education_1.default.create({ category, title, description, examples });
        return res.status(201).json({ success: true, data: tip });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', error: err });
    }
});
exports.createTip = createTip;
const updateTip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const update = req.body;
        const tip = yield Education_1.default.findByIdAndUpdate(id, update, { new: true });
        if (!tip)
            return res.status(404).json({ success: false, message: 'Tip not found' });
        return res.status(200).json({ success: true, data: tip });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', error: err });
    }
});
exports.updateTip = updateTip;
const deleteTip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const tip = yield Education_1.default.findByIdAndDelete(id);
        if (!tip)
            return res.status(404).json({ success: false, message: 'Tip not found' });
        return res.status(200).json({ success: true, message: 'Tip deleted' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error', error: err });
    }
});
exports.deleteTip = deleteTip;
