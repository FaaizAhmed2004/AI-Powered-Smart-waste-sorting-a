"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const adminSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin'],
        default: 'admin'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permissions: [{
            type: String,
            enum: [
                'users.read',
                'users.write',
                'users.delete',
                'classifications.read',
                'classifications.write',
                'classifications.delete',
                'community.read',
                'community.write',
                'community.delete',
                'analytics.read',
                'system.manage'
            ]
        }]
}, {
    timestamps: true,
    versionKey: false
});
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
exports.default = (0, mongoose_1.model)('Admin', adminSchema);
//# sourceMappingURL=Admin.js.map