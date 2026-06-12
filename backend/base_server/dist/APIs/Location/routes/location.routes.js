"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/APIs/Location/routes/location.routes.ts
const express_1 = require("express");
const location_controller_1 = require("../controller/location.controller");
const locationRouter = (0, express_1.Router)();
// Public routes
locationRouter.get('/location/centers', location_controller_1.getRecyclingCenters);
locationRouter.get('/location/nearest', location_controller_1.getNearestRecyclingCenters);
locationRouter.get('/location/waste-types', location_controller_1.getWasteTypes);
exports.default = locationRouter;
