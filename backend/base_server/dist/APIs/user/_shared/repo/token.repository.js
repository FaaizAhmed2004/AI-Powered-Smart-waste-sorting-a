"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_model_1 = __importDefault(require("../models/token.model"));
exports.default = {
    createToken: (payload) => {
        return token_model_1.default.create(payload);
    },
    findToken: (token) => {
        return token_model_1.default.findOne({ token: token });
    },
    saveToken: (token, userId) => {
        return token_model_1.default.create({ token, userId });
    },
    deleteToken: (token) => {
        return token_model_1.default.deleteOne({ token: token });
    }
};
//# sourceMappingURL=token.repository.js.map