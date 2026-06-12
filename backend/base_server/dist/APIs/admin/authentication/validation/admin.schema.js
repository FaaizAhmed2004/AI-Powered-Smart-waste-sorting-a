"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginSchema = exports.adminRegisterSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.adminRegisterSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
    }),
    firstName: joi_1.default.string().optional().trim(),
    lastName: joi_1.default.string().optional().trim(),
    role: joi_1.default.string().valid('super_admin', 'admin').optional().default('admin'),
    permissions: joi_1.default.array().items(joi_1.default.string().valid('users.read', 'users.write', 'users.delete', 'classifications.read', 'classifications.write', 'classifications.delete', 'community.read', 'community.write', 'community.delete', 'analytics.read', 'system.manage')).optional()
});
exports.adminLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: joi_1.default.string().required().messages({
        'any.required': 'Password is required'
    })
});
