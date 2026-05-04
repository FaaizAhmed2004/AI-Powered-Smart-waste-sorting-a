const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/waste-sort';

async function diagnose() {
    console.log('\n=== AI Waste Sort - Admin Setup Diagnostic ===\n');
    
    try {
        // Check environment
        console.log('📋 Environment Check:');
        console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
        console.log('  MongoDB URI:', MONGODB_URI);
        console.log('  BCRYPT_SALT_ROUNDS:', process.env.BCRYPT_SALT_ROUNDS || '10');
        
        // Test MongoDB connection
        console.log('\n🔌 Database Connection Test:');
        console.log('  Attempting to connect to MongoDB...');
        
        const connection = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        
        console.log('  ✓ Successfully connected to MongoDB');
        console.log('  Database name:', connection.connection.name);
        
        // Check Admin collection
        console.log('\n📊 Admin Collection Check:');
        const adminSchema = new mongoose.Schema({ email: String });
        const Admin = mongoose.model('Admin', adminSchema);
        
        const adminCount = await Admin.countDocuments();
        console.log('  Total admins in database:', adminCount);
        
        const admins = await Admin.find({}).select('email role isActive').lean();
        if (admins.length > 0) {
            console.log('  Existing admins:');
            admins.forEach((admin, index) => {
                console.log(`    ${index + 1}. ${admin.email || 'N/A'} (Role: ${admin.role || 'N/A'}, Active: ${admin.isActive || 'N/A'})`);
            });
        } else {
            console.log('  ⚠️  No admins found in database!');
            console.log('  → Run: npm run seed:admin');
        }
        
        console.log('\n✅ Diagnostic Complete\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Diagnostic Error:', error.message);
        console.error('\nTroubleshooting Steps:');
        console.log('  1. Ensure MongoDB is running');
        console.log('  2. Check .env.development file exists in backend/base_server/');
        console.log('  3. Verify MONGODB_URI in .env.development');
        console.log('  4. Run: npm run seed:admin\n');
        process.exit(1);
    }
}

diagnose();
