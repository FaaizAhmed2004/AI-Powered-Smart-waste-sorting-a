"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const async_1 = __importDefault(require("../../../handlers/async"));
const authenticate_1 = __importDefault(require("../../../middlewares/authenticate"));
const insightController_1 = require("../controller/insightController");
const insightValidator_1 = require("../validator/insightValidator");
const Insightrouter = (0, express_1.Router)();
Insightrouter.post("/insights/generate", authenticate_1.default, insightValidator_1.generateReportValidator, (0, async_1.default)(insightController_1.generateUserReport));
Insightrouter.get("/insights/report/:userId", authenticate_1.default, insightValidator_1.getUserReportValidator, async_1.default, insightController_1.getUserReport);
exports.default = Insightrouter;
//# sourceMappingURL=insightroutes.js.map