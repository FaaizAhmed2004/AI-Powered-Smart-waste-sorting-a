"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (_req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(_req);
    if (!errors.isEmpty())
        return _res.status(400).json({ errors: errors.array() });
    return next();
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validatorreauest.js.map