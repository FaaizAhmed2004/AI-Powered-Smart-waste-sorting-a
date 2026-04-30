import { Request, Response } from 'express';
import EducationTip from '../model/Education';
import { validationResult } from 'express-validator';

type AuthReq = Request & { user?: any };

export const getTipsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const tips = await EducationTip.find({ category }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: tips });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const getAllTips = async (_req: Request, res: Response) => {
  try {
    const tips = await EducationTip.find().sort({ category: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: tips });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const createTip = async (req: AuthReq, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { category, title, description, examples } = req.body;
    const tip = await EducationTip.create({ category, title, description, examples });
    return res.status(201).json({ success: true, data: tip });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const updateTip = async (req: AuthReq, res: Response) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const tip = await EducationTip.findByIdAndUpdate(id, update, { new: true });
    if (!tip) return res.status(404).json({ success: false, message: 'Tip not found' });
    return res.status(200).json({ success: true, data: tip });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const deleteTip = async (req: AuthReq, res: Response) => {
  try {
    const { id } = req.params;
    const tip = await EducationTip.findByIdAndDelete(id);
    if (!tip) return res.status(404).json({ success: false, message: 'Tip not found' });
    return res.status(200).json({ success: true, message: 'Tip deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};
