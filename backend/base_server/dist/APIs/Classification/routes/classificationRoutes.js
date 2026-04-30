"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const classificationController_1 = require("../controller/classificationController");
const classificationValidator_1 = require("../validator/classificationValidator");
const authenticate_1 = __importDefault(require("../../../middlewares/authenticate"));
const classificationrouter = express_1.default.Router();
classificationrouter.post('/classify', authenticate_1.default, classificationValidator_1.classifyValidator, classificationController_1.classifyImage);
classificationrouter.get('/classify/history/:userId', authenticate_1.default, classificationValidator_1.getUserClassificationsValidator, classificationController_1.getUserClassifications);
classificationrouter.get('/classify/all', authenticate_1.default, classificationController_1.getAllClassifications);
classificationrouter.delete('/classify/:id', authenticate_1.default, classificationController_1.deleteClassification);
exports.default = classificationrouter;
//# sourceMappingURL=classificationRoutes.js.map