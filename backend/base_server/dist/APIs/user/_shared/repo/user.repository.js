"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
exports.default = {
    findUserByEmail: (email, select = '') => {
        return user_model_1.default.findOne({ email }).select(select);
    },
    findUserById: (id) => {
        return user_model_1.default.findById(id);
    },
    findUserByConfirmationTokenAndCode: (token, code) => {
        return user_model_1.default.findOne({
            'accountConfimation.token': token,
            'accountConfimation.code': code
        });
    },
    createUser: (payload) => {
        return user_model_1.default.create(payload);
    }
};
//# sourceMappingURL=user.repository.js.map