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
const responseMessage_1 = __importDefault(require("../../../../constant/responseMessage"));
const errors_1 = require("../../../../utils/errors");
const user_repository_1 = __importDefault(require("../../_shared/repo/user.repository"));
exports.default = {
    userAlreadyExistsViaEmail: (email) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_repository_1.default.findUserByEmail(email);
        if (user) {
            throw new errors_1.CustomError(responseMessage_1.default.auth.ALREADY_EXISTS('user', email), 422);
        }
        return;
    })
};
//# sourceMappingURL=validations.js.map