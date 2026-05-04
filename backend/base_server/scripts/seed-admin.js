const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });

// Load environment variables
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/waste-sort';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

// Admin schema
const adminSchema = new mongoose.Schema({
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
    firstName: String,
    lastName: String,
    role: {
        type: String,
        enum: ['super_admin', 'admin'],
        default: 'admin'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permissions: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Admin = mongoose.model('Admin', adminSchema);

async function seedAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        console.log('MongoDB URI:', MONGODB_URI);
        
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Check if admin exists
        const adminExists = await Admin.findOne({ email: 'admin@wasteSort.com' });
        
        if (adminExists) {
            console.log('✓ Admin already exists:', adminExists.email);
            process.exit(0);
        }

        // Hash password
        const password = 'Admin@123';
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        // Create admin
        const admin = await Admin.create({
            email: 'admin@wasteSort.com',
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Admin',
            role: 'super_admin',
            isActive: true,
            permissions: [
                'users.read', 'users.write', 'users.delete',
                'classifications.read', 'classifications.write', 'classifications.delete',
                'community.read', 'community.write', 'community.delete',
                'analytics.read', 'system.manage'
            ]
        });

        console.log('✓ Admin created successfully:');
        console.log('  Email:', admin.email);
        console.log('  Password:', password);
        console.log('  Role:', admin.role);
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('✗ Error seeding admin:', error.message);
        process.exit(1);
    }
}

seedAdmin();
