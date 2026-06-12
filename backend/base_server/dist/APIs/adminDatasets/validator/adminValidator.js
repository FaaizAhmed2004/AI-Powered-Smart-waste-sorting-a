"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetUsersValidator = exports.datasetUploadValidator = exports.retrainValidator = void 0;
const express_validator_1 = require("express-validator");
exports.retrainValidator = [
    (0, express_validator_1.body)('reason').optional().isString(),
    (0, express_validator_1.body)('datasetId').optional().isString()
];
exports.datasetUploadValidator = [
    // file handling (multer) handles file presence, but we can validate label
    (0, express_validator_1.body)('label').optional().isString().withMessage('label must be string'),
];
exports.adminGetUsersValidator = [
    (0, express_validator_1.param)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.param)('limit').optional().isInt({ min: 1 }),
];
