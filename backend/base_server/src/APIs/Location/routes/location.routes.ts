// src/APIs/Location/routes/location.routes.ts
import { Router } from 'express';
import { getRecyclingCenters, getNearestRecyclingCenters, getWasteTypes } from '../controller/location.controller';

const locationRouter = Router();

// Public routes
locationRouter.get('/location/centers', getRecyclingCenters);
locationRouter.get('/location/nearest', getNearestRecyclingCenters);
locationRouter.get('/location/waste-types', getWasteTypes);

export default locationRouter;