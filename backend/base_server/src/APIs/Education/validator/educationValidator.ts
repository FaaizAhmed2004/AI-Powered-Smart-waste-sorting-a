/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { param, body } from 'express-validator';

export const getTipsByCategoryValidator = [
  param('category').notEmpty().withMessage('Category is required'),
];

export const createTipValidator = [
  body('category').notEmpty().withMessage('Category is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
];

export const updateTipValidator = [
  param('id').notEmpty().withMessage('Tip id is required'),
  body('title').optional(),
  body('description').optional(),
  body('examples').optional().isArray().withMessage('Examples must be an array'),
];
