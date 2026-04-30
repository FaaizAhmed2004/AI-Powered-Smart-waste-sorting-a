// src/routes/insight.routes.ts

import { Router } from 'express';
import asyncHandler from '../../../handlers/async';
import authenticate from '../../../middlewares/authenticate';

import {
  generateUserReport,
  getUserReport,
} from '../controller/insightController';

import {
  generateReportValidator,
  getUserReportValidator,
} from '../validator/insightValidator';

const Insightrouter = Router();

Insightrouter.post(
  "/insights/generate",
  authenticate,
  generateReportValidator,
  asyncHandler(generateUserReport as any)
);

Insightrouter.get(
  "/insights/report/:userId",
  authenticate,
  getUserReportValidator,
  asyncHandler,getUserReport
);

export default Insightrouter;
