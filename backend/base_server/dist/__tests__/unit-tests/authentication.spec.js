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
const authentication_service_1 = require("../../APIs/user/authentication/authentication.service");
const user_repository_1 = __importDefault(require("../../APIs/user/_shared/repo/user.repository"));
const validations_1 = __importDefault(require("../../APIs/user/authentication/validation/validations"));
const email_1 = __importDefault(require("../../services/email"));
const errors_1 = require("../../utils/errors");
const parsers_1 = __importDefault(require("../../utils/parsers"));
const responseMessage_1 = __importDefault(require("../../constant/responseMessage"));
const date_and_time_1 = __importDefault(require("../../utils/date-and-time"));
const code_1 = __importDefault(require("../../utils/code"));
const hashing_1 = __importDefault(require("../../utils/hashing"));
const jwt_1 = __importDefault(require("../../utils/jwt"));
const token_repository_1 = __importDefault(require("../../APIs/user/_shared/repo/token.repository"));
jest.mock('../../APIs/user/_shared/repo/user.repository');
jest.mock('../../services/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined)
}));
process.env.ACCESS_TOKEN_SECRET = 'access-secret';
process.env.REFRESH_TOKEN_SECRET = 'refresh-secret';
jest.mock('../../utils/parsers');
jest.mock('../../utils/date-and-time');
jest.mock('../../APIs/user/authentication/validation/validations');
jest.mock('../../utils/hashing');
jest.mock('../../utils/code');
jest.mock('../../utils/jwt');
jest.mock('../../APIs/user/_shared/repo/token.repository');
describe('registrationService', () => {
    const mockPayload = {
        name: 'John Doe',
        phoneNumber: '1234567890',
        email: 'john.doe@example.com',
        password: 'securepassword',
        consent: true
    };
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should throw an error if phone number is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        ;
        parsers_1.default.parsePhoneNumber.mockReturnValue({ countryCode: null, internationalNumber: null, isoCode: null });
        yield expect((0, authentication_service_1.registrationService)(mockPayload)).rejects.toThrow(new errors_1.CustomError(responseMessage_1.default.auth.INVALID_PHONE_NUMBER, 422));
    }));
    it('should throw an error if timezone is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        ;
        parsers_1.default.parsePhoneNumber.mockReturnValue({ countryCode: 'US', internationalNumber: '1234567890', isoCode: 'US' });
        date_and_time_1.default.countryTimezone.mockReturnValue([]);
        yield expect((0, authentication_service_1.registrationService)(mockPayload)).rejects.toThrow(new errors_1.CustomError(responseMessage_1.default.auth.INVALID_PHONE_NUMBER, 422));
    }));
    it('should validate if user already exists via email', () => __awaiter(void 0, void 0, void 0, function* () {
        ;
        parsers_1.default.parsePhoneNumber.mockReturnValue({ countryCode: 'US', internationalNumber: '1234567890', isoCode: 'US' });
        date_and_time_1.default.countryTimezone.mockReturnValue([{ name: 'America/New_York' }]);
        validations_1.default.userAlreadyExistsViaEmail.mockRejectedValue(new errors_1.CustomError(responseMessage_1.default.auth.ALREADY_EXISTS(mockPayload.email, 'User'), 422));
        yield expect((0, authentication_service_1.registrationService)(mockPayload)).rejects.toThrow('User already exists');
    }));
    it('should successfully register a user and send a confirmation email', () => __awaiter(void 0, void 0, void 0, function* () {
        ;
        parsers_1.default.parsePhoneNumber.mockReturnValue({ countryCode: 'US', internationalNumber: '1234567890', isoCode: 'US' });
        date_and_time_1.default.countryTimezone.mockReturnValue([{ name: 'America/New_York' }]);
        validations_1.default.userAlreadyExistsViaEmail.mockResolvedValue(undefined);
        hashing_1.default.hashPassword.mockResolvedValue('hashedpassword');
        code_1.default.generateRandomId.mockReturnValue('randomToken');
        code_1.default.generateOTP.mockReturnValue('123456');
        user_repository_1.default.createUser.mockResolvedValue({ _id: 'newUserId' });
        const response = yield (0, authentication_service_1.registrationService)(mockPayload);
        expect(response).toEqual({ success: true, _id: 'newUserId' });
        expect(email_1.default.sendEmail).toHaveBeenCalledWith([mockPayload.email], 'Confirm your account', expect.stringContaining(`Hey ${mockPayload.name}, Please confirm your account by clicking the link below`));
    }));
});
describe('loginService', () => {
    const mockPayload = {
        email: 'john.doe@example.com',
        password: 'securepassword'
    };
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should throw an error if user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        ;
        user_repository_1.default.findUserByEmail.mockResolvedValue(null);
        yield expect((0, authentication_service_1.loginService)(mockPayload)).rejects.toThrow(new errors_1.CustomError(responseMessage_1.default.NOT_FOUND('User'), 404));
    }));
    it('should throw an error if password is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = { _id: 'userId', password: 'hashedPassword' };
        user_repository_1.default.findUserByEmail.mockResolvedValue(mockUser);
        hashing_1.default.comparePassword.mockResolvedValue(false);
        yield expect((0, authentication_service_1.loginService)(mockPayload)).rejects.toThrow(new errors_1.CustomError(responseMessage_1.default.auth.INVALID_EMAIL_OR_PASSWORD, 400));
    }));
    it('should successfully log in a user and return tokens', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = { _id: 'userId', password: 'hashedPassword', save: jest.fn() };
        user_repository_1.default.findUserByEmail.mockResolvedValue(mockUser);
        hashing_1.default.comparePassword.mockResolvedValue(true);
        jwt_1.default.generateToken.mockImplementation(() => {
            return 'mockDefaultToken';
        });
        token_repository_1.default.createToken.mockResolvedValue(undefined);
        const response = yield (0, authentication_service_1.loginService)(mockPayload);
        expect(response).toEqual({
            success: true,
            user: mockUser,
            accessToken: 'mockDefaultToken',
            refreshToken: 'mockDefaultToken'
        });
        expect(mockUser.save).toHaveBeenCalled();
        expect(token_repository_1.default.createToken).toHaveBeenCalledWith({ token: 'mockDefaultToken' });
    }));
});
describe('accountConfirmationService', () => {
    const mockSave = jest.fn();
    const mockUser = {
        _id: '12345',
        email: 'test@example.com',
        accountConfimation: {
            status: false,
            timestamp: null
        },
        save: mockSave
    };
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should throw an error if user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        ;
        user_repository_1.default.findUserByConfirmationTokenAndCode.mockResolvedValue(null);
        yield expect((0, authentication_service_1.accountConfirmationService)('token', 'code')).rejects.toThrow(new errors_1.CustomError('Account does not exist', 404));
    }));
    it('should throw an error if account is already confirmed', () => __awaiter(void 0, void 0, void 0, function* () {
        ;
        user_repository_1.default.findUserByConfirmationTokenAndCode.mockResolvedValue(Object.assign(Object.assign({}, mockUser), { accountConfimation: { status: true } }));
        yield expect((0, authentication_service_1.accountConfirmationService)('token', 'code')).rejects.toThrow(new errors_1.CustomError('Account already CONFIRMED', 400));
    }));
    it('should confirm the account and send an email', () => __awaiter(void 0, void 0, void 0, function* () {
        ;
        user_repository_1.default.findUserByConfirmationTokenAndCode.mockResolvedValue(mockUser);
        yield (0, authentication_service_1.accountConfirmationService)('token', 'code');
        expect(mockUser.accountConfimation.status).toBe(true);
        expect(mockUser.accountConfimation.timestamp).toBeTruthy();
        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(email_1.default.sendEmail).toHaveBeenCalledWith([mockUser.email], 'Welcome to the base! ', 'Account has been confirmed.');
    }));
});
//# sourceMappingURL=authentication.spec.js.map