"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_controller_1 = __importDefault(require("./authentication.controller"));
const authenticate_1 = __importDefault(require("../../../middlewares/authenticate"));
const router = (0, express_1.Router)();
router.route('/register').post(authentication_controller_1.default.register);
router.route('/registeration/confirm/:token').patch(authentication_controller_1.default.confirmRegistration);
router.route('/login').post(authentication_controller_1.default.login);
router.route('/refresh').post(authentication_controller_1.default.refreshToken);
router.route('/logout').put(authenticate_1.default, authentication_controller_1.default.logout);
exports.default = router;
//# sourceMappingURL=index.js.map