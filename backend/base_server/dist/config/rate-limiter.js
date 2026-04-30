"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRateLimiter = exports.rateLimiterMongo = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
exports.rateLimiterMongo = null;
const DURATION = 60;
const POINTS = 10;
const initRateLimiter = (mongooseConnection) => {
    exports.rateLimiterMongo = new rate_limiter_flexible_1.RateLimiterMongo({
        storeClient: mongooseConnection,
        points: POINTS,
        duration: DURATION
    });
};
exports.initRateLimiter = initRateLimiter;
//# sourceMappingURL=rate-limiter.js.map