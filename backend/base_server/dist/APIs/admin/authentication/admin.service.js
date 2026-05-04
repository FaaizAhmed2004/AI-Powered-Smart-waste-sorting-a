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
exports.adminLoginService = exports.adminRegistrationService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../../config/config"));
const logger_1 = __importDefault(require("../../../handlers/logger"));
const Admin_1 = __importDefault(require("../model/Admin"));
const errors_1 = require("../../../utils/errors");
const adminRegistrationService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName, role = 'admin', permissions = [] } = payload;
    const normalizedEmail = email.trim().toLowerCase();
    const existingAdmin = yield Admin_1.default.findOne({ email: normalizedEmail });
    if (existingAdmin) {
        throw new errors_1.CustomError('Admin with this email already exists', 409);
    }
    let adminPermissions = permissions;
    if (role === 'super_admin') {
        adminPermissions = [
            'users.read', 'users.write', 'users.delete',
            'classifications.read', 'classifications.write', 'classifications.delete',
            'community.read', 'community.write', 'community.delete',
            'analytics.read', 'system.manage'
        ];
    }
    else if (permissions.length === 0) {
        adminPermissions = ['users.read', 'classifications.read', 'community.read', 'analytics.read'];
    }
    const saltRounds = parseInt(config_1.default.BCRYPT.SALT_ROUNDS);
    const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
    const newAdmin = yield Admin_1.default.create({
        email: normalizedEmail,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        permissions: adminPermissions,
        isActive: true
    });
    const adminData = {
        _id: newAdmin._id.toString(),
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        role: newAdmin.role,
        permissions: newAdmin.permissions,
        isActive: newAdmin.isActive
    };
    const accessToken = jsonwebtoken_1.default.sign({ adminId: newAdmin._id, role: newAdmin.role, type: 'admin' }, config_1.default.TOKENS.ACCESS.SECRET, { expiresIn: config_1.default.TOKENS.ACCESS.EXPIRY });
    const refreshToken = jsonwebtoken_1.default.sign({ adminId: newAdmin._id, role: newAdmin.role, type: 'admin' }, config_1.default.TOKENS.REFRESH.SECRET, { expiresIn: config_1.default.TOKENS.REFRESH.EXPIRY });
    return {
        success: true,
        message: 'Admin registered successfully',
        data: {
            admin: adminData,
            accessToken,
            refreshToken
        }
    };
});
exports.adminRegistrationService = adminRegistrationService;
const adminLoginService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const normalizedEmail = email.trim().toLowerCase();
    const admin = yield Admin_1.default.findOne({ email: normalizedEmail, isActive: true });
    if (!admin) {
        logger_1.default.error(`Admin login failed: No active admin found with email ${normalizedEmail}`);
        throw new errors_1.CustomError('Invalid credentials', 401);
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, admin.password);
    if (!isPasswordValid) {
        logger_1.default.error(`Admin login failed: Invalid password for email ${normalizedEmail}`);
        throw new errors_1.CustomError('Invalid credentials', 401);
    }
    const adminData = {
        _id: admin._id.toString(),
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive
    };
    const accessToken = jsonwebtoken_1.default.sign({ adminId: admin._id, role: admin.role, type: 'admin' }, config_1.default.TOKENS.ACCESS.SECRET, { expiresIn: config_1.default.TOKENS.ACCESS.EXPIRY });
    const refreshToken = jsonwebtoken_1.default.sign({ adminId: admin._id, role: admin.role, type: 'admin' }, config_1.default.TOKENS.REFRESH.SECRET, { expiresIn: config_1.default.TOKENS.REFRESH.EXPIRY });
    return {
        success: true,
        message: 'Login successful',
        data: {
            admin: adminData,
            accessToken,
            refreshToken
        }
    };
});
exports.adminLoginService = adminLoginService;
//# sourceMappingURL=admin.service.js.map