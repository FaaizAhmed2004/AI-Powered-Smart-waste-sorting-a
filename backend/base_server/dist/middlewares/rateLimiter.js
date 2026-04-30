"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config/config"));
const application_1 = require("../constant/application");
const rate_limiter_1 = require("../config/rate-limiter");
const httpError_1 = __importDefault(require("../handlers/errorHandler/httpError"));
const responseMessage_1 = __importDefault(require("../constant/responseMessage"));
exports.default = (req, _, next) => {
    if (config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT) {
        return next();
    }
    if (rate_limiter_1.rateLimiterMongo) {
        rate_limiter_1.rateLimiterMongo
            .consume(req.ip, 1)
            .then(() => {
            next();
        })
            .catch(() => {
            (0, httpError_1.default)(next, new Error(responseMessage_1.default.TOO_MANY_REQUESTS), req, 429);
        });
    }
};
//# sourceMappingURL=rateLimiter.js.map