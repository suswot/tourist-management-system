const mongoose = require('mongoose');

const circuitSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        locations: {
            type: [String],
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        promotionalImage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Circuit = mongoose.model('Circuit', circuitSchema);

module.exports = Circuit;
