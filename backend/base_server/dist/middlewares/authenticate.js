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
const jwt_1 = __importDefault(require("../utils/jwt"));
const config_1 = __importDefault(require("../config/config"));
const user_repository_1 = __importDefault(require("../APIs/user/_shared/repo/user.repository"));
const httpError_1 = __importDefault(require("../handlers/errorHandler/httpError"));
const responseMessage_1 = __importDefault(require("../constant/responseMessage"));
const async_1 = __importDefault(require("../handlers/async"));
exports.default = (0, async_1.default)((request, _response, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const req = request;
        const { cookies, headers } = req;
        let accessToken = (_a = headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!accessToken) {
            const cookieToken = typeof (cookies === null || cookies === void 0 ? void 0 : cookies.accessToken) === 'string' ? cookies.accessToken : undefined;
            if (cookieToken) {
                accessToken = cookieToken;
            }
        }
        if (accessToken) {
            try {
                const { userId } = jwt_1.default.verifyToken(accessToken, config_1.default.TOKENS.ACCESS.SECRET);
                const user = yield user_repository_1.default.findUserById(userId);
                if (user) {
                    req.authenticatedUser = user;
                    req.user = { _id: userId, id: userId };
                    return next();
                }
            }
            catch (tokenError) {
                if (tokenError instanceof Error) {
                    if (tokenError.name === 'TokenExpiredError') {
                        (0, httpError_1.default)(next, new Error('Access token expired'), request, 401);
                        return;
                    }
                    else if (tokenError.name === 'JsonWebTokenError') {
                        (0, httpError_1.default)(next, new Error('Invalid access token'), request, 401);
                        return;
                    }
                    else {
                        throw tokenError;
                    }
                }
                else {
                    throw tokenError;
                }
            }
        }
        (0, httpError_1.default)(next, new Error(responseMessage_1.default.UNAUTHORIZED), request, 401);
    }
    catch (error) {
        (0, httpError_1.default)(next, error, request, 500);
    }
}));
//# sourceMappingURL=authenticate.js.map