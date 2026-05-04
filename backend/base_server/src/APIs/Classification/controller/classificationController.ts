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

    // Get user ID from authenticated user
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication failed'
      });
    }

    const classification = await Classification.create({
      userId,
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
    console.error('Classification save error:', errorMessage);

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
    
    // Validate user owns this data
    const authenticatedUserId = req.user?._id || req.user?.id;
    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication failed'
      });
    }

    // Security: Only allow users to access their own classifications (unless admin)
    if (userId !== authenticatedUserId) {
      console.warn(`Unauthorized access attempt: User ${authenticatedUserId} tried to access ${userId}'s classifications`);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot access other user\'s classifications'
      });
    }

    const records = await Classification.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: records });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
    console.error('Get classifications error:', errorMessage);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch classifications',
      error: errorMessage
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
    
    // Get the record first to verify ownership
    const record = await Classification.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Verify user owns the record
    const authenticatedUserId = req.user?._id || req.user?.id;
    if (record.userId !== authenticatedUserId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: Cannot delete other user\'s classifications' 
      });
    }

    await Classification.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
    console.error('Delete classification error:', errorMessage);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: errorMessage 
    });
  }
};
