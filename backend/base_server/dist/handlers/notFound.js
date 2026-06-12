"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const responseMessage_1 = __importDefault(require("../constant/responseMessage"));
const httpError_1 = __importDefault(require("./errorHandler/httpError"));
exports.default = (req, _, next) => {
    try {
        throw new Error(responseMessage_1.default.NOT_FOUND('Route'));
    }
    catch (error) {
        (0, httpError_1.default)(next, error, req, 404);
    }
};
