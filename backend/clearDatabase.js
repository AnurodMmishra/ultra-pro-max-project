const mongoose = require('mongoose');
require('dotenv').config();

// Import your User model
const User = require('./models/User');

async function clearDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/deadline-shield');
    console.log('Connected to MongoDB');

    
    const result = await User.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} user records`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database cleared successfully');
    console.log('⚠️  Please restart your server to ensure all cached data is cleared');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
