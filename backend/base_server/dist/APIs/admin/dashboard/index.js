"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_dashboard_controller_1 = __importDefault(require("./admin.dashboard.controller"));
const adminAuth_1 = require("../../../middlewares/adminAuth");
const router = (0, express_1.Router)();
router.get('/admin/dashboard/stats', adminAuth_1.adminAuth, (0, adminAuth_1.requirePermission)('analytics.read'), admin_dashboard_controller_1.default.getDashboardStats);
router.get('/admin/users', adminAuth_1.adminAuth, (0, adminAuth_1.requirePermission)('users.read'), admin_dashboard_controller_1.default.getAllUsers);
router.get('/admin/users/:userId', adminAuth_1.adminAuth, (0, adminAuth_1.requirePermission)('users.read'), admin_dashboard_controller_1.default.getUserById);
router.patch('/admin/users/:userId/status', adminAuth_1.adminAuth, (0, adminAuth_1.requirePermission)('users.write'), admin_dashboard_controller_1.default.updateUserStatus);
router.delete('/admin/users/:userId', adminAuth_1.adminAuth, (0, adminAuth_1.requirePermission)('users.delete'), admin_dashboard_controller_1.default.deleteUser);
router.get('/admin/classifications', adminAuth_1.adminAuth, (0, adminAuth_1.requirePermission)('classifications.read'), admin_dashboard_controller_1.default.getAllClassifications);
router.delete('/admin/classifications/:classificationId', adminAuth_1.adminAuth, (0, adminAuth_1.requirePermission)('classifications.delete'), admin_dashboard_controller_1.default.deleteClassification);
exports.default = router;
//# sourceMappingURL=index.js.map