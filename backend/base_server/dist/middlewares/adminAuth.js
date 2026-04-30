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
exports.requireSuperAdmin = exports.requirePermission = exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const Admin_1 = __importDefault(require("../APIs/admin/model/Admin"));
const errors_1 = require("../utils/errors");
const adminAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = ((_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '')) || ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.adminAccessToken);
        if (!token) {
            res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.TOKENS.ACCESS.SECRET);
        if (decoded.type !== 'admin') {
            res.status(401).json({ success: false, message: 'Access denied. Invalid token type.' });
            return;
        }
        const admin = yield Admin_1.default.findById(decoded.adminId).select('-password');
        if (!admin || !admin.isActive) {
            res.status(401).json({ success: false, message: 'Access denied. Admin not found or inactive.' });
            return;
        }
        req.admin = {
            _id: admin._id.toString(),
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ success: false, message: 'Invalid token' });
            return;
        }
        if (error instanceof errors_1.CustomError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.adminAuth = adminAuth;
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            res.status(401).json({ success: false, message: 'Admin authentication required' });
            return;
        }
        if (req.admin.role === 'super_admin' || req.admin.permissions.includes(permission)) {
            next();
        }
        else {
            res.status(403).json({
                success: false,
                message: `Access denied. Required permission: ${permission}`
            });
        }
    };
};
exports.requirePermission = requirePermission;
const requireSuperAdmin = (req, res, next) => {
    if (!req.admin) {
        res.status(401).json({ success: false, message: 'Admin authentication required' });
        return;
    }
    if (req.admin.role === 'super_admin') {
        next();
    }
    else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Super admin privileges required.'
        });
    }
};
exports.requireSuperAdmin = requireSuperAdmin;
//# sourceMappingURL=adminAuth.js.map