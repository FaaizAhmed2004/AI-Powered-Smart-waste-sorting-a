/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import {
  classifyImage,
  getUserClassifications,
  getAllClassifications,
  deleteClassification
} from '../controller/classificationController';
import { classifyValidator, getUserClassificationsValidator } from '../validator/classificationValidator';
import asyncHandler from '../../../middlewares/authenticate';

const classificationrouter = express.Router();

classificationrouter.post('/classify', asyncHandler, classifyValidator, classifyImage);
classificationrouter.get('/classify/history/:userId', asyncHandler, getUserClassificationsValidator, getUserClassifications);
classificationrouter.get('/classify/all', asyncHandler, getAllClassifications); // Admin check recommended
classificationrouter.delete('/classify/:id', asyncHandler, deleteClassification);

export default  classificationrouter;
