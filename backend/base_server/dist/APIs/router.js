"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const rateLimiter_1 = __importDefault(require("../middlewares/rateLimiter"));
const router = (0, express_1.Router)();
router.route('/self').get(rateLimiter_1.default, controller_1.default.self);
router.route('/health').get(controller_1.default.health);
exports.default = router;
//# sourceMappingURL=router.js.map