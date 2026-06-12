"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROOT = exports.EApplicationEnvironment = void 0;
var EApplicationEnvironment;
(function (EApplicationEnvironment) {
    EApplicationEnvironment["PRODUCTION"] = "production";
    EApplicationEnvironment["DEVELOPMENT"] = "development";
})(EApplicationEnvironment || (exports.EApplicationEnvironment = EApplicationEnvironment = {}));
exports.API_ROOT = '/v1';
