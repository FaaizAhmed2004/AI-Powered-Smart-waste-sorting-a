"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_flow_1 = __importDefault(require("dotenv-flow"));
dotenv_flow_1.default.config();
exports.default = {
    // General
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    SERVER_URL: process.env.SERVER_URL,
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    //Email
    EMAIL_API_KEY: process.env.EMAIL_SERVICE_API_KEY,
    //BCRYPT
    BCRYPT: {
        SALT_ROUNDS: process.env.SALT_ROUNDS || '10'
    },
    //Tokens
    TOKENS: {
        ACCESS: {
            SECRET: process.env.ACCESS_TOKEN_SECRET,
            EXPIRY: 3600
        },
        REFRESH: {
            SECRET: process.env.REFRESH_TOKEN_SECRET,
            EXPIRY: 3600 * 24 * 365
        }
    }
};
