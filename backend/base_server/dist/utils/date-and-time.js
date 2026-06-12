"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const countries_and_timezones_1 = require("countries-and-timezones");
exports.default = {
    countryTimezone: (isoCode) => {
        return (0, countries_and_timezones_1.getTimezonesForCountry)(isoCode);
    }
};
