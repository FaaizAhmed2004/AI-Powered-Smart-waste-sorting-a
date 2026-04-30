import { Schema, model } from 'mongoose'

export interface IAdmin {
    _id?: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    role: 'super_admin' | 'admin'
    isActive: boolean
    permissions: string[]
    createdAt?: Date
    updatedAt?: Date
}

const adminSchema = new Schema<IAdmin>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        firstName: {
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            enum: ['super_admin', 'admin'],
            default: 'admin'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        permissions: [{
            type: String,
            enum: [
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
            ]
        }]
    },
    {
        timestamps: true,
        versionKey: false
    }
)

// Index for better query performance
adminSchema.index({ email: 1 })
adminSchema.index({ role: 1 })
adminSchema.index({ isActive: 1 })

export default model<IAdmin>('Admin', adminSchema)