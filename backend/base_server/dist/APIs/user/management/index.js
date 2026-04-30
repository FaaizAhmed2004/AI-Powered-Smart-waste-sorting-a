"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const management_controller_1 = __importDefault(require("./management.controller"));
const authenticate_1 = __importDefault(require("../../../middlewares/authenticate"));
const rateLimiter_1 = __importDefault(require("../../../middlewares/rateLimiter"));
const router = (0, express_1.Router)();
router.route('/me').get(rateLimiter_1.default, authenticate_1.default, management_controller_1.default.me);
exports.default = router;
//# sourceMappingURL=index.js.map