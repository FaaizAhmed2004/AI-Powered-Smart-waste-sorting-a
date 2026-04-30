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
exports.loginService = exports.accountConfirmationService = exports.registrationService = void 0;
const responseMessage_1 = __importDefault(require("../../../constant/responseMessage"));
const parsers_1 = __importDefault(require("../../../utils/parsers"));
const date_and_time_1 = __importDefault(require("../../../utils/date-and-time"));
const errors_1 = require("../../../utils/errors");
const user_repository_1 = __importDefault(require("../_shared/repo/user.repository"));
const hashing_1 = __importDefault(require("../../../utils/hashing"));
const code_1 = __importDefault(require("../../../utils/code"));
const users_1 = require("../../../constant/users");
const email_1 = __importDefault(require("../../../services/email"));
const logger_1 = __importDefault(require("../../../handlers/logger"));
const validations_1 = __importDefault(require("./validation/validations"));
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const jwt_1 = __importDefault(require("../../../utils/jwt"));
const config_1 = __importDefault(require("../../../config/config"));
const token_repository_1 = __importDefault(require("../_shared/repo/token.repository"));
dayjs_1.default.extend(utc_1.default);
const registrationService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phoneNumber, email, password } = payload;
    const { countryCode, internationalNumber, isoCode } = parsers_1.default.parsePhoneNumber('+' + phoneNumber);
    if (!countryCode || !internationalNumber || !isoCode) {
        throw new errors_1.CustomError(responseMessage_1.default.auth.INVALID_PHONE_NUMBER, 422);
    }
    const timezone = date_and_time_1.default.countryTimezone(isoCode);
    if (!timezone || timezone.length === 0) {
        throw new errors_1.CustomError(responseMessage_1.default.auth.INVALID_PHONE_NUMBER, 422);
    }
    yield validations_1.default.userAlreadyExistsViaEmail(email);
    const hashedPassword = yield hashing_1.default.hashPassword(password);
    const token = code_1.default.generateRandomId();
    const OTP = code_1.default.generateOTP(6);
    const userObj = {
        name,
        email,
        phoneNumber: {
            countryCode,
            isoCode,
            internationalNumber
        },
        accountConfimation: {
            status: false,
            token,
            code: OTP,
            timestamp: null
        },
        passwordReset: {
            token: null,
            expiry: null,
            lastResetAt: null
        },
        lastLoginAt: null,
        role: users_1.EUserRoles.USER,
        timezone: timezone[0].name,
        password: hashedPassword,
        consent: true
    };
    const newUser = yield user_repository_1.default.createUser(userObj);
    const confimationURL = `Frontendhost/confimation/${token}?code=${OTP}`;
    const to = [email];
    const subject = `Confirm your account`;
    const text = `Hey ${name}, Please confirm your account by clicking the link belown\n\n${confimationURL}`;
    email_1.default.sendEmail(to, subject, text).catch((error) => {
        logger_1.default.error('Error sending email', {
            meta: error
        });
    });
    return {
        success: true,
        _id: newUser._id
    };
});
exports.registrationService = registrationService;
const accountConfirmationService = (token, code) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_repository_1.default.findUserByConfirmationTokenAndCode(token, code);
    if (!user) {
        throw new errors_1.CustomError(responseMessage_1.default.auth.USER_NOT_EXIST, 404);
    }
    if (user.accountConfimation.status) {
        throw new errors_1.CustomError(responseMessage_1.default.auth.ALREADY_CONFIRMED('Account'), 400);
    }
    user.accountConfimation.status = true;
    user.accountConfimation.timestamp = (0, dayjs_1.default)().utc().toDate();
    yield user.save();
    const to = [user.email];
    const subject = `Welcome to the base! `;
    const text = `Account has been confirmed.`;
    email_1.default.sendEmail(to, subject, text).catch((error) => {
        logger_1.default.error('Error sending email', {
            meta: error
        });
    });
    return {
        success: true,
        _id: user._id
    };
});
exports.accountConfirmationService = accountConfirmationService;
const loginService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const user = yield user_repository_1.default.findUserByEmail(email, 'password');
    if (!user) {
        throw new errors_1.CustomError(responseMessage_1.default.NOT_FOUND('User'), 404);
    }
    const isValidPassword = yield hashing_1.default.comparePassword(password, user.password);
    if (!isValidPassword) {
        throw new errors_1.CustomError(responseMessage_1.default.auth.INVALID_EMAIL_OR_PASSWORD, 400);
    }
    const accessToken = jwt_1.default.generateToken({ userId: user._id }, config_1.default.TOKENS.ACCESS.SECRET, config_1.default.TOKENS.ACCESS.EXPIRY);
    const refreshToken = jwt_1.default.generateToken({ userId: user._id }, config_1.default.TOKENS.REFRESH.SECRET, config_1.default.TOKENS.REFRESH.EXPIRY);
    user.lastLoginAt = (0, dayjs_1.default)().utc().toDate();
    yield user.save();
    const token = {
        token: refreshToken
    };
    yield token_repository_1.default.createToken(token);
    return {
        success: true,
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken
    };
});
exports.loginService = loginService;
//# sourceMappingURL=authentication.service.js.map