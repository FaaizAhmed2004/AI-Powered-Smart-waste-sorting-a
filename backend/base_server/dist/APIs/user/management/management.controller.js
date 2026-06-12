"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpResponse_1 = __importDefault(require("../../../handlers/httpResponse"));
const responseMessage_1 = __importDefault(require("../../../constant/responseMessage"));
const httpError_1 = __importDefault(require("../../../handlers/errorHandler/httpError"));
const errors_1 = require("../../../utils/errors");
exports.default = {
    me: (request, response, next) => {
        try {
            const { authenticatedUser } = request;
            (0, httpResponse_1.default)(response, request, 201, responseMessage_1.default.SUCCESS, authenticatedUser);
        }
        catch (error) {
            if (error instanceof errors_1.CustomError) {
                (0, httpError_1.default)(next, error, request, error.statusCode);
            }
            else {
                (0, httpError_1.default)(next, error, request, 500);
            }
        }
    }
};
