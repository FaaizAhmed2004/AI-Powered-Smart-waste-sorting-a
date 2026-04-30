import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import config from '../config/config'
import Admin from '../APIs/admin/model/Admin'
import { CustomError } from '../utils/errors'

interface IAdminRequest extends Request {
    admin?: {
        _id: string
        email: string
        role: 'super_admin' | 'admin'
        permissions: string[]
    }
}

interface IJwtPayload {
    adminId: string
    role: 'super_admin' | 'admin'
    type: string
}

export const adminAuth = async (req: IAdminRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.adminAccessToken

        if (!token) {
            res.status(401).json({ success: false, message: 'Access denied. No token provided.' })
            return
        }

        const decoded = jwt.verify(token, config.TOKENS.ACCESS.SECRET) as IJwtPayload

        if (decoded.type !== 'admin') {
            res.status(401).json({ success: false, message: 'Access denied. Invalid token type.' })
            return
        }

        const admin = await Admin.findById(decoded.adminId).select('-password')
        if (!admin || !admin.isActive) {
            res.status(401).json({ success: false, message: 'Access denied. Admin not found or inactive.' })
            return
        }

        req.admin = {
            _id: admin._id!.toString(),
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions
        }

        next()
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ success: false, message: 'Invalid token' })
            return
        }
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ success: false, message: error.message })
            return
        }
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

export const requirePermission = (permission: string) => {
    return (req: IAdminRequest, res: Response, next: NextFunction): void => {
        if (!req.admin) {
            res.status(401).json({ success: false, message: 'Admin authentication required' })
            return
        }

        if (req.admin.role === 'super_admin' || req.admin.permissions.includes(permission)) {
            next()
        } else {
            res.status(403).json({ 
                success: false, 
                message: `Access denied. Required permission: ${permission}` 
            })
        }
    }
}

export const requireSuperAdmin = (req: IAdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
        res.status(401).json({ success: false, message: 'Admin authentication required' })
        return
    }

    if (req.admin.role === 'super_admin') {
        next()
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Access denied. Super admin privileges required.' 
        })
    }
}