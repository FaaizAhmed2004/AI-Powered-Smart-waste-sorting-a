import { initRateLimiter } from '../config/rate-limiter'
import logger from '../handlers/logger'
import database from '../services/database'
import Admin from '../APIs/admin/model/Admin'
import bcrypt from 'bcrypt'
import config from '../config/config'

async function seedDefaultAdmin(): Promise<void> {
    try {
        // Default admin credentials
        const defaultAdmin = {
            email: 'admin@wasteSort.com',
            password: 'Admin@123',
            firstName: 'System',
            lastName: 'Admin',
            role: 'super_admin' as const,
            isActive: true,
            permissions: [
                'users.read', 'users.write', 'users.delete',
                'classifications.read', 'classifications.write', 'classifications.delete',
                'community.read', 'community.write', 'community.delete',
                'analytics.read', 'system.manage'
            ]
        }

        // Check if default admin exists
        const adminExists = await Admin.findOne({ email: defaultAdmin.email })
        if (adminExists) {
            logger.info(`Default admin account already exists, skipping seed`, {
                meta: { email: defaultAdmin.email }
            })
            return
        }

        // Hash the password
        const saltRounds = parseInt(config.BCRYPT.SALT_ROUNDS)
        const hashedPassword = await bcrypt.hash(defaultAdmin.password, saltRounds)

        // Create the admin
        await Admin.create({
            ...defaultAdmin,
            password: hashedPassword
        })

        logger.info(`Default admin account created successfully`, {
            meta: { email: defaultAdmin.email }
        })
        logger.warn(`Please change the default admin password after first login`, {
            meta: { defaultEmail: defaultAdmin.email, defaultPassword: defaultAdmin.password }
        })
    } catch (error) {
        logger.error(`Error seeding default admin:`, { meta: error })
        throw error
    }
}

export async function bootstrap(): Promise<void> {
    try {
        // Connect to the database
        const connection = await database.connect()
        logger.info(`Database connection established`, {
            meta: { CONNECTION_NAME: connection.name }
        })

        // Seed default admin
        await seedDefaultAdmin()

        // Initialize rate limiter
        initRateLimiter(connection)
        logger.info(`Rate limiter initiated`)
    } catch (error) {
        logger.error(`Error during bootstrap:`, { meta: error })
        throw error // Re-throw the error to stop server startup
    }
}
