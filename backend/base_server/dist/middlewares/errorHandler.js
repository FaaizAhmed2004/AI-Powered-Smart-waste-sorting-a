"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.default = (err, _, res, __) => {
    res.status(err.statusCode).json(err);
};
