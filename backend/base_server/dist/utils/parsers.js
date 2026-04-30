"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const libphonenumber_js_1 = require("libphonenumber-js");
exports.default = {
    parsePhoneNumber: (phoneNumber) => {
        try {
            const parsedPhoneNumber = (0, libphonenumber_js_1.parsePhoneNumber)(phoneNumber);
            if (parsedPhoneNumber) {
                return {
                    countryCode: parsedPhoneNumber.countryCallingCode,
                    isoCode: parsedPhoneNumber.country || null,
                    internationalNumber: parsedPhoneNumber.formatInternational()
                };
            }
            return {
                countryCode: null,
                isoCode: null,
                internationalNumber: null
            };
        }
        catch (error) {
            return {
                error: error,
                countryCode: null,
                isoCode: null,
                internationalNumber: null
            };
        }
    }
};
//# sourceMappingURL=parsers.js.map