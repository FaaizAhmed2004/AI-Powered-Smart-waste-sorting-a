
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (_req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(_req);
  if (!errors.isEmpty()) return _res.status(400).json({ errors: errors.array() });
  return next();
};
