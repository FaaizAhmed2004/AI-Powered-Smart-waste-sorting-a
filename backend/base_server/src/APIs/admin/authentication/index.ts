import { Router } from 'express'
import adminController from './admin.controller'

const router = Router()

router.route('/admin/register').post(adminController.register)
router.route('/admin/login').post(adminController.login)
router.route('/admin/logout').post(adminController.logout)

export default router