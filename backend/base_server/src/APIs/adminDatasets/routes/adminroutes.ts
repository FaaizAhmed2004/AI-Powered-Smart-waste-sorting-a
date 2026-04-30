// import express from 'express';
// import {
//   getAllUsers,
//   getAnalytics,
//   uploadDatasetFile,
//   retrainModel
// } from '../controllers/admincontroller';
// import { adminGetUsersValidator, datasetUploadValidator, retrainValidator } from '../validators/adminValidator';
// import { authMiddleware } from '../middleware/authenticate';
// import multer from 'multer';

// const router = express.Router();

// // configure multer for dataset uploads (store on disk; adjust per your infra)
// const upload = multer({
//   dest: 'uploads/dataset/',
//   limits: { fileSize: 10 * 1024 * 1024 } // 10MB
// });

// // Admin-only endpoints (ensure authMiddleware verifies admin role)
// router.get('/admin/users', authMiddleware, adminGetUsersValidator, getAllUsers);
// router.get('/admin/analytics', authMiddleware, getAnalytics);

// // dataset upload (multipart/form-data) - admin
// router.post('/admin/dataset/upload', authMiddleware, upload.single('file'), datasetUploadValidator, uploadDatasetFile);

// // trigger model retrain (calls python microservice)
// router.post('/admin/ai/retrain', authMiddleware, retrainValidator, retrainModel);

// export default router;
