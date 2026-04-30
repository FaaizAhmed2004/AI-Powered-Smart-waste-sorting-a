"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = __importDefault(require("./admin.controller"));
const router = (0, express_1.Router)();
router.route('/admin/register').post(admin_controller_1.default.register);
router.route('/admin/login').post(admin_controller_1.default.login);
router.route('/admin/logout').post(admin_controller_1.default.logout);
exports.default = router;
//# sourceMappingURL=index.js.map