const mongoose = require('mongoose');

const ALLOWED_ROLES = ['Zone_Manager', 'VIP_Liaison', 'Regional_Admin', 'National_Admin'];

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ALLOWED_ROLES, required: true },
    zone: { type: String, enum: ['North', 'West/Central', 'South', 'East', 'North-East', 'All'], default: 'North' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = {
    User: mongoose.model('User', userSchema),
    ALLOWED_ROLES
};
