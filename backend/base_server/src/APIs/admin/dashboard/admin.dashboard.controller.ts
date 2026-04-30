import { Request, Response, NextFunction } from 'express'
import httpResponse from '../../../handlers/httpResponse'
import httpError from '../../../handlers/errorHandler/httpError'
import asyncHandler from '../../../handlers/async'
import { CustomError } from '../../../utils/errors'

// Import models (you'll need to check the actual paths)
import User from '../../user/_shared/models/user.model' // Adjust path as needed
import Classification from '../../Classification/model/Classification'
import Admin from '../model/Admin'

interface IAdminRequest extends Request {
    admin?: {
        _id: string
        email: string
        role: 'super_admin' | 'admin'
        permissions: string[]
    }
}

export default {
    // Get dashboard overview statistics
    getDashboardStats: asyncHandler(async (req: IAdminRequest, res: Response, next: NextFunction) => {
        try {
            const [
                totalUsers,
                totalClassifications,
                totalAdmins,
                recentUsers,
                recentClassifications
            ] = await Promise.all([
                User.countDocuments(),
                Classification.countDocuments(),
                Admin.countDocuments(),
                User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
                Classification.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'email name')
            ])

            // Get classifications by category
            const classificationsByCategory = await Classification.aggregate([
                {
                    $group: {
                        _id: '$label',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ])

            // Get user registrations by month (last 6 months)
            const sixMonthsAgo = new Date()
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

            const userRegistrationsByMonth = await User.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ])

            const stats = {
                overview: {
                    totalUsers,
                    totalClassifications,
                    totalAdmins,
                    activeUsers: await User.countDocuments({ 'accountConfimation.status': true })
                },
                recentActivity: {
                    recentUsers,
                    recentClassifications
                },
                analytics: {
                    classificationsByCategory,
                    userRegistrationsByMonth
                }
            }

            httpResponse(res, req, 200, 'Dashboard statistics retrieved successfully', stats)
        } catch (error) {
            if (error instanceof CustomError) {
                httpError(next, error, req, error.statusCode)
            } else {
                httpError(next, error, req, 500)
            }
        }
    }),

    // Get all users with pagination
    getAllUsers: asyncHandler(async (req: IAdminRequest, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10
            const search = req.query.search as string || ''
            const sortBy = req.query.sortBy as string || 'createdAt'
            const sortOrder = req.query.sortOrder as string || 'desc'

            const skip = (page - 1) * limit

            // Build search query
            const searchQuery: any = {}
            if (search) {
                searchQuery.$or = [
                    { email: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } }
                ]
            }

            // Build sort object
            const sort: any = {}
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1

            const [users, totalUsers] = await Promise.all([
                User.find(searchQuery)
                    .select('-password')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit),
                User.countDocuments(searchQuery)
            ])

            // Get classification counts for each user
            const usersWithStats = await Promise.all(
                users.map(async (user) => {
                    const classificationCount = await Classification.countDocuments({ userId: user._id })
                    return {
                        ...user.toObject(),
                        classificationCount
                    }
                })
            )

            const pagination = {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                hasNext: page < Math.ceil(totalUsers / limit),
                hasPrev: page > 1
            }

            httpResponse(res, req, 200, 'Users retrieved successfully', {
                users: usersWithStats,
                pagination
            })
        } catch (error) {
            if (error instanceof CustomError) {
                httpError(next, error, req, error.statusCode)
            } else {
                httpError(next, error, req, 500)
            }
        }
    }),

    // Get user details by ID
    getUserById: asyncHandler(async (req: IAdminRequest, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params

            const user = await User.findById(userId).select('-password')
            if (!user) {
                throw new CustomError('User not found', 404)
            }

            // Get user's classifications
            const classifications = await Classification.find({ userId }).sort({ createdAt: -1 })

            // Get user statistics
            const stats = {
                totalClassifications: classifications.length,
                classificationsByCategory: await Classification.aggregate([
                    { $match: { userId: user._id } },
                    {
                        $group: {
                            _id: '$label',
                            count: { $sum: 1 }
                        }
                    }
                ])
            }

            httpResponse(res, req, 200, 'User details retrieved successfully', {
                user,
                classifications,
                stats
            })
        } catch (error) {
            if (error instanceof CustomError) {
                httpError(next, error, req, error.statusCode)
            } else {
                httpError(next, error, req, 500)
            }
        }
    }),

    // Update user status (activate/deactivate)
    updateUserStatus: asyncHandler(async (req: IAdminRequest, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params
            const { isActive } = req.body

            const user = await User.findByIdAndUpdate(
                userId,
                { 'accountConfimation.status': isActive },
                { new: true }
            ).select('-password')

            if (!user) {
                throw new CustomError('User not found', 404)
            }

            httpResponse(res, req, 200, 'User status updated successfully', user)
        } catch (error) {
            if (error instanceof CustomError) {
                httpError(next, error, req, error.statusCode)
            } else {
                httpError(next, error, req, 500)
            }
        }
    }),

    // Delete user
    deleteUser: asyncHandler(async (req: IAdminRequest, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params

            const user = await User.findById(userId)
            if (!user) {
                throw new CustomError('User not found', 404)
            }

            // Delete user's classifications
            await Classification.deleteMany({ userId })

            // Delete user
            await User.findByIdAndDelete(userId)

            httpResponse(res, req, 200, 'User deleted successfully', null)
        } catch (error) {
            if (error instanceof CustomError) {
                httpError(next, error, req, error.statusCode)
            } else {
                httpError(next, error, req, 500)
            }
        }
    }),

    // Get all classifications with pagination
    getAllClassifications: asyncHandler(async (req: IAdminRequest, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10
            const category = req.query.category as string
            const sortBy = req.query.sortBy as string || 'createdAt'
            const sortOrder = req.query.sortOrder as string || 'desc'

            const skip = (page - 1) * limit

            // Build filter query
            const filterQuery: any = {}
            if (category) {
                filterQuery.label = category
            }

            // Build sort object
            const sort: any = {}
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1

            const [classifications, totalClassifications] = await Promise.all([
                Classification.find(filterQuery)
                    .populate('userId', 'email name')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit),
                Classification.countDocuments(filterQuery)
            ])

            const pagination = {
                currentPage: page,
                totalPages: Math.ceil(totalClassifications / limit),
                totalClassifications,
                hasNext: page < Math.ceil(totalClassifications / limit),
                hasPrev: page > 1
            }

            httpResponse(res, req, 200, 'Classifications retrieved successfully', {
                classifications,
                pagination
            })
        } catch (error) {
            if (error instanceof CustomError) {
                httpError(next, error, req, error.statusCode)
            } else {
                httpError(next, error, req, 500)
            }
        }
    }),

    // Delete classification
    deleteClassification: asyncHandler(async (req: IAdminRequest, res: Response, next: NextFunction) => {
        try {
            const { classificationId } = req.params

            const classification = await Classification.findByIdAndDelete(classificationId)
            if (!classification) {
                throw new CustomError('Classification not found', 404)
            }

            httpResponse(res, req, 200, 'Classification deleted successfully', null)
        } catch (error) {
            if (error instanceof CustomError) {
                httpError(next, error, req, error.statusCode)
            } else {
                httpError(next, error, req, 500)
            }
        }
    })
}