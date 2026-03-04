const mongoose = require('mongoose');

const hotelSchema = mongoose.Schema(
    {
        bookingId: {
            type: String,
            required: true,
            unique: true,
        },
        hotelName: {
            type: String,
            required: true,
        },
        bookingSite: {
            type: String,
            default: 'MakeMyTrip'
        },
        location: {
            type: String,
            required: true,
        },
        touristId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tourist',
            required: true,
        },
        checkInDate: {
            type: Date,
            required: true,
        },
        checkOutDate: {
            type: Date,
            required: true,
        },
        Guide_ID: {
            type: String,
        },
        guideVerified: {
            type: Boolean,
            default: false,
        },
        auditFlags: {
            dateMismatch: {
                type: Boolean,
                default: false,
            },
            resolved: {
                type: Boolean,
                default: false,
            }
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook or calculation can be done at the controller level
// but we will do verification at controller for dynamic dates

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
