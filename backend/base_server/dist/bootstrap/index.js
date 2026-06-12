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
exports.bootstrap = bootstrap;
const rate_limiter_1 = require("../config/rate-limiter");
const logger_1 = __importDefault(require("../handlers/logger"));
const database_1 = __importDefault(require("../services/database"));
const Admin_1 = __importDefault(require("../APIs/admin/model/Admin"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../config/config"));
function seedDefaultAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Default admin credentials
            const defaultAdmin = {
                email: 'admin@wasteSort.com',
                password: 'Admin@123',
                firstName: 'System',
                lastName: 'Admin',
                role: 'super_admin',
                isActive: true,
                permissions: [
                    'users.read', 'users.write', 'users.delete',
                    'classifications.read', 'classifications.write', 'classifications.delete',
                    'community.read', 'community.write', 'community.delete',
                    'analytics.read', 'system.manage'
                ]
            };
            // Check if default admin exists
            const adminExists = yield Admin_1.default.findOne({ email: defaultAdmin.email });
            if (adminExists) {
                logger_1.default.info(`Default admin account already exists, skipping seed`, {
                    meta: { email: defaultAdmin.email }
                });
                return;
            }
            // Hash the password
            const saltRounds = parseInt(config_1.default.BCRYPT.SALT_ROUNDS);
            const hashedPassword = yield bcrypt_1.default.hash(defaultAdmin.password, saltRounds);
            // Create the admin
            yield Admin_1.default.create(Object.assign(Object.assign({}, defaultAdmin), { password: hashedPassword }));
            logger_1.default.info(`Default admin account created successfully`, {
                meta: { email: defaultAdmin.email }
            });
            logger_1.default.warn(`Please change the default admin password after first login`, {
                meta: { defaultEmail: defaultAdmin.email, defaultPassword: defaultAdmin.password }
            });
        }
        catch (error) {
            logger_1.default.error(`Error seeding default admin:`, { meta: error });
            throw error;
        }
    });
}
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to the database
            const connection = yield database_1.default.connect();
            logger_1.default.info(`Database connection established`, {
                meta: { CONNECTION_NAME: connection.name }
            });
            // Seed default admin
            yield seedDefaultAdmin();
            // Initialize rate limiter
            (0, rate_limiter_1.initRateLimiter)(connection);
            logger_1.default.info(`Rate limiter initiated`);
        }
        catch (error) {
            logger_1.default.error(`Error during bootstrap:`, { meta: error });
            throw error; // Re-throw the error to stop server startup
        }
    });
}
