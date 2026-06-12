"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTipValidator = exports.createTipValidator = exports.getTipsByCategoryValidator = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
const express_validator_1 = require("express-validator");
exports.getTipsByCategoryValidator = [
    (0, express_validator_1.param)('category').notEmpty().withMessage('Category is required'),
];
exports.createTipValidator = [
    (0, express_validator_1.body)('category').notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
];
exports.updateTipValidator = [
    (0, express_validator_1.param)('id').notEmpty().withMessage('Tip id is required'),
    (0, express_validator_1.body)('title').optional(),
    (0, express_validator_1.body)('description').optional(),
    (0, express_validator_1.body)('examples').optional().isArray().withMessage('Examples must be an array'),
];
