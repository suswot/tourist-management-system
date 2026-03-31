const mongoose = require('mongoose');
const { User } = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const checkUsers = async () => {
    try {
        // Local Diagnostic Backup: mongodb://localhost:27017/tms
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://suswot69_db_user:4DgtWuBFpvayXZVC@ac-i9lkxfe-shard-00-00.u3oivzc.mongodb.net:27017,ac-i9lkxfe-shard-00-01.u3oivzc.mongodb.net:27017,ac-i9lkxfe-shard-00-02.u3oivzc.mongodb.net:27017/tms?ssl=true&replicaSet=atlas-xmcknr-shard-0&authSource=admin&appName=safarsafe');
        const users = await User.find({});
        console.log('Users in DB:', users.map(u => ({ email: u.email, role: u.role, zone: u.zone })));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
