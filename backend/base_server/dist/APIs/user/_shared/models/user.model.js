"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const users_1 = require("../../../../constant/users");
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        minlength: 2,
        maxlength: 72,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phoneNumber: {
        _id: false,
        isoCode: {
            type: String,
            required: true
        },
        countryCode: {
            type: String,
            required: true
        },
        internationalNumber: {
            type: String,
            required: true
        }
    },
    timezone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        default: users_1.EUserRoles.USER,
        enum: users_1.EUserRoles,
        required: true
    },
    accountConfimation: {
        _id: false,
        status: {
            type: Boolean,
            default: false,
            required: true
        },
        token: {
            type: String,
            rquired: true
        },
        code: {
            type: String,
            rquired: true
        },
        timestamp: {
            type: Date,
            rquired: true
        }
    },
    passwordReset: {
        _id: false,
        token: {
            type: String,
            default: null
        },
        expiry: {
            type: Number,
            default: null
        },
        lastResetAt: {
            type: Date,
            default: null
        }
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    consent: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=user.model.js.map