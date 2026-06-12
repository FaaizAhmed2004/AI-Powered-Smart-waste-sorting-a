"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpResponse_1 = __importDefault(require("../handlers/httpResponse"));
const responseMessage_1 = __importDefault(require("../constant/responseMessage"));
const httpError_1 = __importDefault(require("../handlers/errorHandler/httpError"));
const health_1 = __importDefault(require("../utils/health"));
exports.default = {
    self: (request, response, next) => {
        try {
            // throw new Error('errors')
            (0, httpResponse_1.default)(response, request, 200, responseMessage_1.default.SUCCESS, null);
        }
        catch (error) {
            (0, httpError_1.default)(next, error, request, 500);
        }
    },
    health: (request, response, next) => {
        try {
            const healthData = {
                application: health_1.default.getApplicationHealth(),
                system: health_1.default.getSystemHealth(),
                timeStamp: Date.now()
            };
            (0, httpResponse_1.default)(response, request, 200, responseMessage_1.default.SUCCESS, healthData);
        }
        catch (error) {
            (0, httpError_1.default)(next, error, request, 500);
        }
    }
};
