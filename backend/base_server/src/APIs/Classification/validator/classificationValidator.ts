import { body, param } from 'express-validator';

export const classifyValidator = [
  body('imageUrl').notEmpty().withMessage('Image URL is required'),
  body('label').notEmpty().withMessage('Label is required'),
  body('confidence').isFloat({ min: 0, max: 1 }).withMessage('Confidence must be a number between 0 and 1')
];

export const getUserClassificationsValidator = [
  param('userId').notEmpty().withMessage('User ID is required')
];
