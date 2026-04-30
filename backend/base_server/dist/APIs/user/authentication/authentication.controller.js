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
const httpResponse_1 = __importDefault(require("../../../handlers/httpResponse"));
const responseMessage_1 = __importDefault(require("../../../constant/responseMessage"));
const httpError_1 = __importDefault(require("../../../handlers/errorHandler/httpError"));
const joi_validate_1 = require("../../../utils/joi-validate");
const validation_schema_1 = require("./validation/validation.schema");
const authentication_service_1 = require("./authentication.service");
const errors_1 = require("../../../utils/errors");
const async_1 = __importDefault(require("../../../handlers/async"));
const health_1 = __importDefault(require("../../../utils/health"));
const application_1 = require("../../../constant/application");
const config_1 = __importDefault(require("../../../config/config"));
const token_repository_1 = __importDefault(require("../_shared/repo/token.repository"));
exports.default = {
    register: (0, async_1.default)((request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { body } = request;
            const { error, payload } = (0, joi_validate_1.validateSchema)(validation_schema_1.registerSchema, body);
            if (error) {
                return (0, httpError_1.default)(next, error, request, 422);
            }
            const registrationResult = yield (0, authentication_service_1.registrationService)(payload);
            if (registrationResult.success === true) {
                (0, httpResponse_1.default)(response, request, 201, responseMessage_1.default.auth.USER_REGISTERED, registrationResult);
            }
        }
        catch (error) {
            if (error instanceof errors_1.CustomError) {
                (0, httpError_1.default)(next, error, request, error.statusCode);
            }
            else {
                (0, httpError_1.default)(next, error, request, 500);
            }
        }
    })),
    confirmRegistration: (0, async_1.default)((request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { params, query } = request;
            const { token } = params;
            const { code } = query;
            const user = yield (0, authentication_service_1.accountConfirmationService)(token, code);
            (0, httpResponse_1.default)(response, request, 201, responseMessage_1.default.auth.USER_REGISTERED, user);
        }
        catch (error) {
            if (error instanceof errors_1.CustomError) {
                (0, httpError_1.default)(next, error, request, error.statusCode);
            }
            else {
                (0, httpError_1.default)(next, error, request, 500);
            }
        }
    })),
    login: (0, async_1.default)((request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { body } = request;
            const { error, payload } = (0, joi_validate_1.validateSchema)(validation_schema_1.loginSchema, body);
            if (error) {
                return (0, httpError_1.default)(next, error, request, 422);
            }
            const isLoggedIn = yield (0, authentication_service_1.loginService)(payload);
            if (isLoggedIn.success === true) {
                const DOMAIN = health_1.default.getDomain();
                response
                    .cookie('accessToken', isLoggedIn.accessToken, {
                    path: '/v1',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000 * config_1.default.TOKENS.ACCESS.EXPIRY,
                    httpOnly: true,
                    secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
                })
                    .cookie('refreshToken', isLoggedIn.refreshToken, {
                    path: '/v1',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000 * config_1.default.TOKENS.REFRESH.EXPIRY,
                    httpOnly: true,
                    secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
                });
                (0, httpResponse_1.default)(response, request, 200, responseMessage_1.default.auth.LOGIN_SUCCESSFUL, isLoggedIn);
            }
        }
        catch (error) {
            if (error instanceof errors_1.CustomError) {
                (0, httpError_1.default)(next, error, request, error.statusCode);
            }
            else {
                (0, httpError_1.default)(next, error, request, 500);
            }
        }
    })),
    logout: (0, async_1.default)((request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { cookies } = request;
            const { refreshToken } = cookies;
            if (refreshToken) {
                yield token_repository_1.default.deleteToken(refreshToken);
            }
            const DOMAIN = health_1.default.getDomain();
            response
                .clearCookie('accessToken', {
                path: '/v1',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * config_1.default.TOKENS.ACCESS.EXPIRY,
                httpOnly: true,
                secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
            })
                .clearCookie('refreshToken', {
                path: '/v1',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * config_1.default.TOKENS.REFRESH.EXPIRY,
                httpOnly: true,
                secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
            });
            (0, httpResponse_1.default)(response, request, 200, responseMessage_1.default.SUCCESS, null);
        }
        catch (error) {
            (0, httpError_1.default)(next, error, request, 500);
        }
    }))
};
//# sourceMappingURL=authentication.controller.js.map