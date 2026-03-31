const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Dev/Offline Backup: mongodb://localhost:27017/tourist-management
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://suswot69_db_user:4wcJVqFcv7B2GweC@ac-i9lkxfe-shard-00-00.u3oivzc.mongodb.net:27017,ac-i9lkxfe-shard-00-01.u3oivzc.mongodb.net:27017,ac-i9lkxfe-shard-00-02.u3oivzc.mongodb.net:27017/tms?ssl=true&replicaSet=atlas-xmcknr-shard-0&authSource=admin&appName=safarsafe');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
