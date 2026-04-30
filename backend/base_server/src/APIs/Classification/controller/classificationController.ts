/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from 'express';
import Classification from '../model/Classification';
import { validationResult } from 'express-validator';

interface AuthUser {
  id?: string;
}

type AuthReq = Request & { user?: AuthUser };

/**
 * @desc Save classification result to database
 * @route POST /api/classify
 * @access Private
 */
export const classifyImage = async (req: AuthReq, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { imageUrl, label, confidence } = req.body;
    if (!imageUrl || !label || confidence === undefined) {
      return res.status(400).json({ 
        message: 'imageUrl, label, and confidence are required' 
      });
    }

    const classification = await Classification.create({
      userId: req.user?.id,
      imageUrl,
      label,
      confidence: parseFloat(confidence)
    });

    return res.status(201).json({
      success: true,
      message: 'Classification saved successfully',
      data: classification
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);

    return res.status(500).json({
      success: false,
      message: 'Failed to save classification',
      error: errorMessage
    });
  }
};

/**
 * @desc Get all classifications for logged-in user
 * @route GET /api/classify/history/:userId
 * @access Private
 */
export const getUserClassifications = async (req: AuthReq, res: Response) => {
  try {
    const { userId } = req.params;
    const records = await Classification.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: records });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch classifications',
      error: err
    });
  }
};

/**
 * @desc Get all classifications (Admin)
 * @route GET /api/classify/all
 * @access Admin
 */
export const getAllClassifications = async (_req: Request, res: Response) => {
  try {
    const records = await Classification.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: records });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

/**
 * @desc Delete classification by ID
 * @route DELETE /api/classify/:id
 * @access Private
 */
export const deleteClassification = async (req: AuthReq, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Classification.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Record not found' });
    return res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};
