
import { body, param } from 'express-validator';

export const retrainValidator = [
  body('reason').optional().isString(),
  body('datasetId').optional().isString()
];

export const datasetUploadValidator = [
  // file handling (multer) handles file presence, but we can validate label
  body('label').optional().isString().withMessage('label must be string'),
];

export const adminGetUsersValidator = [
  param('page').optional().isInt({ min: 1 }),
  param('limit').optional().isInt({ min: 1 }),
];
