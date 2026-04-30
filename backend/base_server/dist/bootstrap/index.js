"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = bootstrap;
const rate_limiter_1 = require("../config/rate-limiter");
const logger_1 = __importDefault(require("../handlers/logger"));
const database_1 = __importDefault(require("../services/database"));
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield database_1.default.connect();
            logger_1.default.info(`Database connection established`, {
                meta: { CONNECTION_NAME: connection.name }
            });
            (0, rate_limiter_1.initRateLimiter)(connection);
            logger_1.default.info(`Rate limiter initiated`);
        }
        catch (error) {
            logger_1.default.error(`Error during bootstrap:`, { meta: error });
            throw error;
        }
    });
}
//# sourceMappingURL=index.js.map