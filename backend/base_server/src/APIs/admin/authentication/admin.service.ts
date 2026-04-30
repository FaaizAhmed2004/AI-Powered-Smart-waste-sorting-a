import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '../../../config/config'
import Admin from '../model/Admin'
import { IAdminRegisterRequest, IAdminLoginRequest, IAdminAuthResponse, IAuthenticatedAdmin } from './types/admin.interface'
import { CustomError } from '../../../utils/errors'

export const adminRegistrationService = async (payload: IAdminRegisterRequest): Promise<IAdminAuthResponse> => {
    const { email, password, firstName, lastName, role = 'admin', permissions = [] } = payload

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email })
    if (existingAdmin) {
        throw new CustomError('Admin with this email already exists', 409)
    }

    // Set default permissions based on role
    let adminPermissions = permissions
    if (role === 'super_admin') {
        adminPermissions = [
            'users.read', 'users.write', 'users.delete',
            'classifications.read', 'classifications.write', 'classifications.delete',
            'community.read', 'community.write', 'community.delete',
            'analytics.read', 'system.manage'
        ]
    } else if (permissions.length === 0) {
        adminPermissions = ['users.read', 'classifications.read', 'community.read', 'analytics.read']
    }

    // Hash password
    const saltRounds = parseInt(config.BCRYPT.SALT_ROUNDS)
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create admin
    const newAdmin = await Admin.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        permissions: adminPermissions,
        isActive: true
    })

    // Generate tokens
    const adminData: IAuthenticatedAdmin = {
        _id: newAdmin._id!.toString(),
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        role: newAdmin.role,
        permissions: newAdmin.permissions,
        isActive: newAdmin.isActive
    }

    const accessToken = jwt.sign(
        { adminId: newAdmin._id, role: newAdmin.role, type: 'admin' },
        config.TOKENS.ACCESS.SECRET,
        { expiresIn: config.TOKENS.ACCESS.EXPIRY }
    )

    const refreshToken = jwt.sign(
        { adminId: newAdmin._id, role: newAdmin.role, type: 'admin' },
        config.TOKENS.REFRESH.SECRET,
        { expiresIn: config.TOKENS.REFRESH.EXPIRY }
    )

    return {
        success: true,
        message: 'Admin registered successfully',
        data: {
            admin: adminData,
            accessToken,
            refreshToken
        }
    }
}

export const adminLoginService = async (payload: IAdminLoginRequest): Promise<IAdminAuthResponse> => {
    const { email, password } = payload

    // Find admin
    const admin = await Admin.findOne({ email, isActive: true })
    if (!admin) {
        throw new CustomError('Invalid credentials', 401)
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    if (!isPasswordValid) {
        throw new CustomError('Invalid credentials', 401)
    }

    // Generate tokens
    const adminData: IAuthenticatedAdmin = {
        _id: admin._id!.toString(),
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive
    }

    const accessToken = jwt.sign(
        { adminId: admin._id, role: admin.role, type: 'admin' },
        config.TOKENS.ACCESS.SECRET,
        { expiresIn: config.TOKENS.ACCESS.EXPIRY }
    )

    const refreshToken = jwt.sign(
        { adminId: admin._id, role: admin.role, type: 'admin' },
        config.TOKENS.REFRESH.SECRET,
        { expiresIn: config.TOKENS.REFRESH.EXPIRY }
    )

    return {
        success: true,
        message: 'Login successful',
        data: {
            admin: adminData,
            accessToken,
            refreshToken
        }
    }
}