/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Request, Response } from 'express';
import InsightReport from '../model/Insight';
import Classification from '../../Classification/model/Classification';
import { validationResult } from 'express-validator';

type AuthReq = Request & { user?: string };

/**
 * Generate a simple aggregated report for the user between two dates.
 * This implementation reads classification records and aggregates counts/weights.
 * You can extend it to compute CO2 saved based on custom factors.
 */
export const generateUserReport = async (req: AuthReq, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { userId, periodStart, periodEnd } = req.body;
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    // Example aggregation from Classification collection
    const records = await Classification.find({
      userId,
      createdAt: { $gte: start, $lte: end },
    });

    // Simple totals by label (assuming each record weight = 1 unit; replace with real weight if available)
    const totals: Record<string, number> = {};
    let totalCount = 0;
    records.forEach(r => {
      totals[r.label] = (totals[r.label] || 0) + 1;
      totalCount++;
    });

    // Placeholder CO2 calculations: assume 0.5 kg CO2 per unit recycled (replace with real factors)
    const co2SavedKg = totalCount * 0.5;

    const report = await InsightReport.create({
      userId,
      periodStart: start,
      periodEnd: end,
      totals: {
        plastic: totals['Plastic'] || 0,
        paper: totals['Paper'] || 0,
        metal: totals['Metal'] || 0,
        organic: totals['Organic'] || 0,
        eWaste: totals['E-Waste'] || 0,
        hazardous: totals['Hazardous'] || 0,
        totalWeightKg: totalCount, // if real weight available, sum weights instead
      },
      co2SavedKg
    });

    return res.status(201).json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const getUserReport = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const reports = await InsightReport.find({ userId }).sort({ periodStart: -1 });
    return res.status(200).json({ success: true, data: reports });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};
