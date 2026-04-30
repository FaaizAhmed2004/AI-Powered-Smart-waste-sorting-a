"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (err, _, res, __) => {
    res.status(err.statusCode).json(err);
};
//# sourceMappingURL=errorHandler.js.map