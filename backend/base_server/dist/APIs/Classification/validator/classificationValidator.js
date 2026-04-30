"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserClassificationsValidator = exports.classifyValidator = void 0;
const express_validator_1 = require("express-validator");
exports.classifyValidator = [
    (0, express_validator_1.body)('imageUrl').notEmpty().withMessage('Image URL is required'),
    (0, express_validator_1.body)('label').notEmpty().withMessage('Label is required'),
    (0, express_validator_1.body)('confidence').isFloat({ min: 0, max: 1 }).withMessage('Confidence must be a number between 0 and 1')
];
exports.getUserClassificationsValidator = [
    (0, express_validator_1.param)('userId').notEmpty().withMessage('User ID is required')
];
//# sourceMappingURL=classificationValidator.js.map