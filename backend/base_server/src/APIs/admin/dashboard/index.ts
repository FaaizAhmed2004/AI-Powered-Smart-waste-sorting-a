import { Router } from 'express'
import adminDashboardController from './admin.dashboard.controller'
import { adminAuth, requirePermission } from '../../../middlewares/adminAuth'

const router = Router()

// Dashboard overview
router.get('/admin/dashboard/stats', 
    adminAuth, 
    requirePermission('analytics.read'), 
    adminDashboardController.getDashboardStats
)

// User management
router.get('/admin/users', 
    adminAuth, 
    requirePermission('users.read'), 
    adminDashboardController.getAllUsers
)

router.get('/admin/users/:userId', 
    adminAuth, 
    requirePermission('users.read'), 
    adminDashboardController.getUserById
)

router.patch('/admin/users/:userId/status', 
    adminAuth, 
    requirePermission('users.write'), 
    adminDashboardController.updateUserStatus
)

router.delete('/admin/users/:userId', 
    adminAuth, 
    requirePermission('users.delete'), 
    adminDashboardController.deleteUser
)

// Classification management
router.get('/admin/classifications', 
    adminAuth, 
    requirePermission('classifications.read'), 
    adminDashboardController.getAllClassifications
)

router.delete('/admin/classifications/:classificationId', 
    adminAuth, 
    requirePermission('classifications.delete'), 
    adminDashboardController.deleteClassification
)

export default router