const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    zone: { type: String, required: true },
    utility_stress: {
        type: String,
        enum: ['NORMAL', 'RESOURCE_STRAIN'],
        default: 'NORMAL'
    },
    capacityLimit: { type: Number, default: 15 }
}, { timestamps: true });

const City = mongoose.model('City', citySchema);
module.exports = City;
