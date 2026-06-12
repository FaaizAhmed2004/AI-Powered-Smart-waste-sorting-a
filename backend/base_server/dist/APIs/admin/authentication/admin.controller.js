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
const httpError_1 = __importDefault(require("../../../handlers/errorHandler/httpError"));
const joi_validate_1 = require("../../../utils/joi-validate");
const admin_schema_1 = require("./validation/admin.schema");
const admin_service_1 = require("./admin.service");
const errors_1 = require("../../../utils/errors");
const async_1 = __importDefault(require("../../../handlers/async"));
const health_1 = __importDefault(require("../../../utils/health"));
const application_1 = require("../../../constant/application");
const config_1 = __importDefault(require("../../../config/config"));
exports.default = {
    register: (0, async_1.default)((request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { body } = request;
            // Payload validation
            const { error, payload } = (0, joi_validate_1.validateSchema)(admin_schema_1.adminRegisterSchema, body);
            if (error) {
                return (0, httpError_1.default)(next, error, request, 422);
            }
            const registrationResult = yield (0, admin_service_1.adminRegistrationService)(payload);
            if (registrationResult.success === true) {
                // Set cookies
                const DOMAIN = health_1.default.getDomain();
                response
                    .cookie('adminAccessToken', registrationResult.data.accessToken, {
                    path: '/v1',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000 * config_1.default.TOKENS.ACCESS.EXPIRY,
                    httpOnly: true,
                    secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
                })
                    .cookie('adminRefreshToken', registrationResult.data.refreshToken, {
                    path: '/v1',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000 * config_1.default.TOKENS.REFRESH.EXPIRY,
                    httpOnly: true,
                    secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
                });
                (0, httpResponse_1.default)(response, request, 201, 'Admin registered successfully', registrationResult);
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
    login: (0, async_1.default)((request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { body } = request;
            // Payload validation
            const { error, payload } = (0, joi_validate_1.validateSchema)(admin_schema_1.adminLoginSchema, body);
            if (error) {
                return (0, httpError_1.default)(next, error, request, 422);
            }
            const loginResult = yield (0, admin_service_1.adminLoginService)(payload);
            if (loginResult.success === true) {
                // Set cookies
                const DOMAIN = health_1.default.getDomain();
                response
                    .cookie('adminAccessToken', loginResult.data.accessToken, {
                    path: '/v1',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000 * config_1.default.TOKENS.ACCESS.EXPIRY,
                    httpOnly: true,
                    secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
                })
                    .cookie('adminRefreshToken', loginResult.data.refreshToken, {
                    path: '/v1',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000 * config_1.default.TOKENS.REFRESH.EXPIRY,
                    httpOnly: true,
                    secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
                });
                (0, httpResponse_1.default)(response, request, 200, 'Login successful', loginResult);
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
            const DOMAIN = health_1.default.getDomain();
            // Clear cookies
            response
                .clearCookie('adminAccessToken', {
                path: '/v1',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * config_1.default.TOKENS.ACCESS.EXPIRY,
                httpOnly: true,
                secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
            })
                .clearCookie('adminRefreshToken', {
                path: '/v1',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * config_1.default.TOKENS.REFRESH.EXPIRY,
                httpOnly: true,
                secure: !(config_1.default.ENV === application_1.EApplicationEnvironment.DEVELOPMENT)
            });
            (0, httpResponse_1.default)(response, request, 200, 'Logout successful', null);
        }
        catch (error) {
            (0, httpError_1.default)(next, error, request, 500);
        }
    }))
};
