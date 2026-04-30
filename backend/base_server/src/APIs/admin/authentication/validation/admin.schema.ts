import Joi from 'joi'

export const adminRegisterSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
    }),
    firstName: Joi.string().optional().trim(),
    lastName: Joi.string().optional().trim(),
    role: Joi.string().valid('super_admin', 'admin').optional().default('admin'),
    permissions: Joi.array().items(
        Joi.string().valid(
            'users.read',
            'users.write', 
            'users.delete',
            'classifications.read',
            'classifications.write',
            'classifications.delete',
            'community.read',
            'community.write',
            'community.delete',
            'analytics.read',
            'system.manage'
        )
    ).optional()
})

export const adminLoginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required'
    })
})