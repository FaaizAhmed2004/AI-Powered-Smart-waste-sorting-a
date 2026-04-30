"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = void 0;
const validateSchema = (schema, value) => {
    const result = schema.validate(value);
    return {
        payload: result.value,
        error: result.error
    };
};
exports.validateSchema = validateSchema;
//# sourceMappingURL=joi-validate.js.map