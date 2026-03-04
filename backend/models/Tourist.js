const mongoose = require('mongoose');

const touristSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        aadhaarNumber: {
            type: String,
            unique: true,
            sparse: true,
        },
        passportNumber: {
            type: String,
            unique: true,
            sparse: true,
        },
        verificationStatus: {
            type: String,
            enum: ['Pending', 'Verified', 'Rejected'],
            default: 'Pending',
        },
        policeStatus: {
            type: String,
            enum: ['Pending', 'Verified', 'Flagged', 'Security Risk'],
            default: 'Pending',
        },
        sosActive: {
            type: Boolean,
            default: false,
        },
        currentLocation: {
            lat: { type: Number },
            lng: { type: Number },
        },
        zone: {
            type: String,
            enum: ['North', 'West/Central', 'South', 'East', 'North-East'],
            required: true,
            default: 'North'
        },
        is_VIP: {
            type: Boolean,
            default: false,
        },
        riskScore: {
            type: Number,
            default: 0
        },
        circuitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Circuit',
            required: true,
        },
        itineraryDate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Tourist = mongoose.model('Tourist', touristSchema);

module.exports = Tourist;
