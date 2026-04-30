
import { param, body } from 'express-validator';

export const getUserReportValidator = [
  param('userId').notEmpty().withMessage('userId is required'),
];

export const generateReportValidator = [
  body('userId').notEmpty().withMessage('userId is required'),
  body('periodStart').notEmpty().isISO8601().toDate().withMessage('Valid periodStart is required'),
  body('periodEnd').notEmpty().isISO8601().toDate().withMessage('Valid periodEnd is required'),
];
