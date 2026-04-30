"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const educationController_1 = require("../controller/educationController");
const educationValidator_1 = require("../validator/educationValidator");
const async_1 = __importDefault(require("../../../handlers/async"));
const educationrouter = express_1.default.Router();
educationrouter.get('/education/tips', educationController_1.getAllTips);
educationrouter.get('/education/tips/:category', educationValidator_1.getTipsByCategoryValidator, educationController_1.getTipsByCategory);
educationrouter.post('/education/tips', async_1.default, educationValidator_1.createTipValidator, educationController_1.createTip);
educationrouter.put('/education/tips/:id', async_1.default, educationValidator_1.updateTipValidator, educationController_1.updateTip);
educationrouter.delete('/education/tips/:id', async_1.default, educationController_1.deleteTip);
exports.default = educationrouter;
//# sourceMappingURL=educationroutes.js.map