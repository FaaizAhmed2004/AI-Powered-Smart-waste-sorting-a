"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
exports.default = {
    generateRandomId: () => (0, uuid_1.v4)(),
    generateOTP: (length) => {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return (0, crypto_1.randomInt)(min, max).toString();
    }
};
