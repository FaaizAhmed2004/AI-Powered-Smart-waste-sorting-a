"use strict";
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { Request, Response } from 'express';
// import User from '../../../APIs/user/_shared/models/user.model';
// // import DatasetFile from '../models/DatasetFile';
// import { validationResult } from 'express-validator';
// import axios from 'axios';
// // import fs from 'fs';
// // import path from 'path';
// // import Dataset from '../../adminDatasets/';
// type AuthReq = Request & { user?: string };
// /**
//  * Get paginated users (Admin)
//  */
// export const getAllUsers = async (req: AuthReq, res: Response) => {
//   try {
//     const page = Number(req.query.page || 1);
//     const limit = Number(req.query.limit || 20);
//     const skip = (page - 1) * limit;
//     const users = await User.find().skip(skip).limit(limit).select('-password');
//     const total = await User.countDocuments();
//     return res.status(200).json({ success: true, data: users, meta: { total, page, limit } });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Server error', error: err });
//   }
// };
// /**
//  * Admin analytics: basic aggregation example
//  */
// export const getAnalytics = async (_req: Request, res: Response) => {
//   try {
//     // Example aggregations: counts of users, classifications, posts, etc.
//     const usersCount = await User.countDocuments();
//     const classificationsCount = await (await import('../models/Classification')).default.countDocuments();
//     const postsCount = await (await import('../../Community/model/')).default.countDocuments();
//     return res.status(200).json({
//       success: true,
//       data: {
//         usersCount,
//         classificationsCount,
//         postsCount
//       }
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Server error', error: err });
//   }
// };
// /**
//  * Upload dataset file metadata (file upload handled by multer in route)
//  */
// export const uploadDatasetFile = async (req: AuthReq, res: Response) => {
//   try {
//     // multer should attach file to req.file
//     const file = (req as any).file;
//     if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });
//     const { label } = req.body;
//     const fileDoc = await Dataset.create({
//       filename: file.filename,
//       originalName: file.originalname,
//       uploaderId: req.user?.id,
//       label,
//       size: file.size,
//       mimeType: file.mimetype
//     });
//     return res.status(201).json({ success: true, data: fileDoc });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Upload failed', error: err });
//   }
// };
// /**
//  * Trigger AI retraining (calls the Python AI microservice retrain endpoint)
//  */
// export const retrainModel = async (req: AuthReq, res: Response) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
//     const payload = req.body || {};
//     // Call AI microservice retrain endpoint (example)
//     const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
//     const response = await axios.post(`${aiServiceUrl}/retrain`, payload, { timeout: 10_000 });
//     return res.status(200).json({ success: true, data: response.data });
//   } catch (err: any) {
//     const message = err?.response?.data || err.message;
//     return res.status(500).json({ success: false, message: 'Retrain request failed', error: message });
//   }
// };
