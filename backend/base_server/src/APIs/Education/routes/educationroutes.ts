import express from 'express';
import {
  getTipsByCategory,
  getAllTips,
  createTip,
  updateTip,
  deleteTip
} from '../controller/educationController'
import { getTipsByCategoryValidator, createTipValidator, updateTipValidator } from '../validator/educationValidator';
import asyncHandler from '../../../handlers/async';

const educationrouter = express.Router();

// Public
educationrouter.get('/education/tips', getAllTips);
educationrouter.get('/education/tips/:category', getTipsByCategoryValidator, getTipsByCategory);

// Admin (protected)
educationrouter.post('/education/tips', asyncHandler, createTipValidator, createTip);
educationrouter.put('/education/tips/:id', asyncHandler, updateTipValidator, updateTip);
educationrouter.delete('/education/tips/:id', asyncHandler, deleteTip);

export default educationrouter;
