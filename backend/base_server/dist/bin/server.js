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
const app_1 = __importDefault(require("../app"));
const bootstrap_1 = require("../bootstrap");
const config_1 = __importDefault(require("../config/config"));
const logger_1 = __importDefault(require("../handlers/logger"));
const server = app_1.default.listen(config_1.default.PORT);
void (() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, bootstrap_1.bootstrap)().then(() => {
            logger_1.default.info(`Application started on port ${config_1.default.PORT}`, {
                meta: { SERVER_URL: config_1.default.SERVER_URL }
            });
        });
    }
    catch (error) {
        logger_1.default.error(`Error starting server:`, { meta: error });
        server.close((err) => {
            if (err)
                logger_1.default.error(`error`, { meta: error });
            process.exit(1);
        });
    }
}))();
