"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportValidator = exports.getUserReportValidator = void 0;
const express_validator_1 = require("express-validator");
exports.getUserReportValidator = [
    (0, express_validator_1.param)('userId').notEmpty().withMessage('userId is required'),
];
exports.generateReportValidator = [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('userId is required'),
    (0, express_validator_1.body)('periodStart').notEmpty().isISO8601().toDate().withMessage('Valid periodStart is required'),
    (0, express_validator_1.body)('periodEnd').notEmpty().isISO8601().toDate().withMessage('Valid periodEnd is required'),
];
//# sourceMappingURL=insightValidator.js.map