/* eslint-disable @typescript-eslint/no-explicit-any */
// src/middleware/validate.ts
import { ZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body as Record<string, any>,
        params: req.params as Record<string, any>,
        query: req.query as Record<string, any>,
      });
      return next();
    } catch (error: unknown) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Validation error',
      });
    }
  };
